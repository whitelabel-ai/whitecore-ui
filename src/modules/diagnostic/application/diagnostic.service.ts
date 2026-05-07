import { db } from '@/lib/db';
import { z } from 'zod';

export const DiagnosticArea = [
  'general',
  'strategy',
  'operations',
  'finance',
  'technology',
  'human-resources',
  'marketing-sales',
  'legal',
] as const;

const areaSchema = z.enum(DiagnosticArea);

const severitySchema = z.enum(['critical', 'high', 'medium', 'low']);

const problemSchema = z.object({
  description: z.string().min(1),
  severity: severitySchema,
});

const saveAreaSchema = z.object({
  diagnosticCaseId: z.string().uuid(),
  areaKey: areaSchema,
  data: z.record(z.string(), z.any()),
  problems: z.array(problemSchema),
  opportunities: z.string(),
  notes: z.string(),
});

export type SaveAreaInput = z.infer<typeof saveAreaSchema>;

export type SaveAreaResult =
  | { success: true; areaContextId: string; action: 'create' | 'update' }
  | { success: false; error: string };

export function saveAreaContext(input: SaveAreaInput): SaveAreaResult {
  const areaValid = areaSchema.safeParse(input.areaKey);
  if (!areaValid.success) {
    return { success: false, error: 'Área no válida' };
  }

  const parsed = saveAreaSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Datos de entrada inválidos' };
  }

  const { diagnosticCaseId, areaKey, data, problems, opportunities, notes } = parsed.data;

  // Verificar que el caso existe
  const caseExists = db.prepare('SELECT id FROM diagnostic_cases WHERE id = ?').get(diagnosticCaseId);
  if (!caseExists) {
    return { success: false, error: 'Caso de diagnóstico no encontrado' };
  }

  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM area_contexts WHERE diagnostic_case_id = ? AND area_key = ?').get(diagnosticCaseId, areaKey) as { id: string } | undefined;

  let areaContextId: string;
  let action: 'create' | 'update';
  if (existing) {
    areaContextId = existing.id;
    action = 'update';
    db.prepare(`
      UPDATE area_contexts
      SET data_json = ?, problems_json = ?, opportunities = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(data), JSON.stringify(problems), opportunities, notes, now, areaContextId);
  } else {
    areaContextId = crypto.randomUUID();
    action = 'create';
    db.prepare(`
      INSERT INTO area_contexts (id, diagnostic_case_id, area_key, data_json, problems_json, opportunities, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(areaContextId, diagnosticCaseId, areaKey, JSON.stringify(data), JSON.stringify(problems), opportunities, notes, now, now);
  }

  return { success: true, areaContextId, action };
}

export function getAreaContext(diagnosticCaseId: string, areaKey: string) {
  const row = db.prepare(`
    SELECT area_key, data_json, problems_json, opportunities, notes, updated_at
    FROM area_contexts
    WHERE diagnostic_case_id = ? AND area_key = ?
  `).get(diagnosticCaseId, areaKey) as {
    area_key: string;
    data_json: string;
    problems_json: string;
    opportunities: string;
    notes: string;
    updated_at: string;
  } | undefined;

  if (!row) return undefined;

  return {
    areaKey: row.area_key,
    data: JSON.parse(row.data_json),
    problems: JSON.parse(row.problems_json),
    opportunities: row.opportunities,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

export function getDiagnosticSummary(diagnosticCaseId: string) {
  const rows = db.prepare(`
    SELECT area_key, problems_json
    FROM area_contexts
    WHERE diagnostic_case_id = ?
  `).all(diagnosticCaseId) as Array<{
    area_key: string;
    problems_json: string;
  }>;

  let totalProblems = 0;
  let criticalProblems = 0;
  let highProblems = 0;

  for (const row of rows) {
    const problems = JSON.parse(row.problems_json) as Array<{ severity: string }>;
    totalProblems += problems.length;
    criticalProblems += problems.filter((p) => p.severity === 'critical').length;
    highProblems += problems.filter((p) => p.severity === 'high').length;
  }

  return {
    areasCompleted: rows.length,
    totalProblems,
    criticalProblems,
    highProblems,
  };
}

const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

export function calculateAreaScore(problems: Array<{ severity: string }>): number {
  const penalty = problems.reduce((sum, p) => sum + (SEVERITY_WEIGHTS[p.severity] || 0), 0);
  return Math.max(0, 100 - penalty);
}

export function getExecutiveSummary(diagnosticCaseId: string) {
  const rows = db.prepare(`
    SELECT area_key, data_json, problems_json, opportunities, notes
    FROM area_contexts
    WHERE diagnostic_case_id = ?
  `).all(diagnosticCaseId) as Array<{
    area_key: string;
    data_json: string;
    problems_json: string;
    opportunities: string;
    notes: string;
  }>;

  let totalProblems = 0;
  let criticalProblems = 0;
  let highProblems = 0;
  const areaScores: Array<{ areaKey: string; score: number; opportunities: string }> = [];
  const allProblems: Array<{ description: string; severity: string; areaKey: string }> = [];

  for (const row of rows) {
    const problems = JSON.parse(row.problems_json) as Array<{ description: string; severity: string }>;
    totalProblems += problems.length;
    criticalProblems += problems.filter((p) => p.severity === 'critical').length;
    highProblems += problems.filter((p) => p.severity === 'high').length;

    const score = calculateAreaScore(problems);
    areaScores.push({ areaKey: row.area_key, score, opportunities: row.opportunities });

    for (const p of problems) {
      allProblems.push({ description: p.description, severity: p.severity, areaKey: row.area_key });
    }
  }

  const overallScore = areaScores.length > 0
    ? Math.round(areaScores.reduce((sum, a) => sum + a.score, 0) / areaScores.length)
    : 0;

  const topProblems = allProblems.sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return {
    areasCompleted: rows.length,
    totalProblems,
    criticalProblems,
    highProblems,
    overallScore,
    areaScores,
    topProblems,
  };
}

export function getCompaniesForSuperadmin() {
  const companies = db.prepare(`
    SELECT id, name, industry, size, created_at
    FROM companies
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `).all() as Array<{
    id: string;
    name: string;
    industry: string | null;
    size: string | null;
    created_at: string;
  }>;

  const result = [];
  for (const company of companies) {
    const caseRow = db.prepare(`
      SELECT id FROM diagnostic_cases WHERE company_id = ? AND status != 'archived'
    `).get(company.id) as { id: string } | undefined;

    let areasCompleted = 0;
    let totalProblems = 0;
    let criticalProblems = 0;

    if (caseRow) {
      const summary = getDiagnosticSummary(caseRow.id);
      areasCompleted = summary.areasCompleted;
      totalProblems = summary.totalProblems;
      criticalProblems = summary.criticalProblems;
    }

    result.push({
      id: company.id,
      name: company.name,
      industry: company.industry,
      size: company.size,
      createdAt: company.created_at,
      diagnosticCaseId: caseRow?.id || null,
      areasCompleted,
      totalProblems,
      criticalProblems,
    });
  }

  return result;
}

export function generateDiagnosticReport(diagnosticCaseId: string) {
  const caseRow = db.prepare(`
    SELECT dc.id as case_id, dc.company_id, dc.status, dc.created_at, dc.updated_at,
           c.name as company_name, c.industry, c.size
    FROM diagnostic_cases dc
    JOIN companies c ON c.id = dc.company_id
    WHERE dc.id = ?
  `).get(diagnosticCaseId) as {
    case_id: string;
    company_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    company_name: string;
    industry: string | null;
    size: string | null;
  } | undefined;

  if (!caseRow) return null;

  const areaRows = db.prepare(`
    SELECT area_key, data_json, problems_json, opportunities, notes, created_at, updated_at
    FROM area_contexts
    WHERE diagnostic_case_id = ?
    ORDER BY area_key
  `).all(diagnosticCaseId) as Array<{
    area_key: string;
    data_json: string;
    problems_json: string;
    opportunities: string;
    notes: string;
    created_at: string;
    updated_at: string;
  }>;

  const areas = areaRows.map((row) => {
    const problems = JSON.parse(row.problems_json) as Array<{ description: string; severity: string }>;
    return {
      areaKey: row.area_key,
      data: JSON.parse(row.data_json),
      problems,
      opportunities: row.opportunities,
      notes: row.notes,
      score: calculateAreaScore(problems),
      updatedAt: row.updated_at,
    };
  });

  const summary = getExecutiveSummary(diagnosticCaseId);

  return {
    caseId: caseRow.case_id,
    company: {
      id: caseRow.company_id,
      name: caseRow.company_name,
      industry: caseRow.industry,
      size: caseRow.size,
    },
    status: caseRow.status,
    createdAt: caseRow.created_at,
    updatedAt: caseRow.updated_at,
    generatedAt: new Date().toISOString(),
    areas,
    summary,
  };
}

export function auditAreaContextChange(
  areaContextId: string,
  diagnosticCaseId: string,
  companyId: string,
  userId: string,
  userName: string,
  areaKey: string,
  action: 'create' | 'update'
) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO area_context_audits (id, area_context_id, diagnostic_case_id, company_id, user_id, user_name, area_key, action, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(crypto.randomUUID(), areaContextId, diagnosticCaseId, companyId, userId, userName, areaKey, action, now);
}

export function getTimelineByCompany(companyId: string) {
  const rows = db.prepare(`
    SELECT id, area_context_id, user_id, user_name, area_key, action, created_at
    FROM area_context_audits
    WHERE company_id = ?
    ORDER BY created_at DESC, id DESC
  `).all(companyId) as Array<{
    id: string;
    area_context_id: string;
    user_id: string;
    user_name: string;
    area_key: string;
    action: string;
    created_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    areaContextId: row.area_context_id,
    userId: row.user_id,
    userName: row.user_name,
    areaKey: row.area_key,
    action: row.action,
    createdAt: row.created_at,
  }));
}

export function getTimelineForSuperadmin() {
  const rows = db.prepare(`
    SELECT a.id, a.area_context_id, a.user_id, a.user_name, a.area_key, a.action, a.created_at,
           c.name as company_name, a.company_id
    FROM area_context_audits a
    JOIN companies c ON c.id = a.company_id
    ORDER BY a.created_at DESC, a.id DESC
  `).all() as Array<{
    id: string;
    area_context_id: string;
    user_id: string;
    user_name: string;
    area_key: string;
    action: string;
    created_at: string;
    company_name: string;
    company_id: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    areaContextId: row.area_context_id,
    userId: row.user_id,
    userName: row.user_name,
    areaKey: row.area_key,
    action: row.action,
    createdAt: row.created_at,
    companyName: row.company_name,
    companyId: row.company_id,
  }));
}
