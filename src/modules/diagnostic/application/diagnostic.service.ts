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
  | { success: true }
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

  if (existing) {
    db.prepare(`
      UPDATE area_contexts
      SET data_json = ?, problems_json = ?, opportunities = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(data), JSON.stringify(problems), opportunities, notes, now, existing.id);
  } else {
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO area_contexts (id, diagnostic_case_id, area_key, data_json, problems_json, opportunities, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, diagnosticCaseId, areaKey, JSON.stringify(data), JSON.stringify(problems), opportunities, notes, now, now);
  }

  return { success: true };
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
