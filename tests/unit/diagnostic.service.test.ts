import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveAreaContext,
  getAreaContext,
  getDiagnosticSummary,
  calculateAreaScore,
  getExecutiveSummary,
  getCompaniesForSuperadmin,
  generateDiagnosticReport,
  auditAreaContextChange,
  getTimelineByCompany,
  getTimelineForSuperadmin,
} from '@/modules/diagnostic/application/diagnostic.service';
import { registerCompany } from '@/modules/company/application/company-registration.service';
import { db } from '@/lib/db';

describe.sequential('Diagnostic Service', () => {
  beforeEach(() => {
    db.pragma('foreign_keys = OFF');
    db.exec('DELETE FROM area_contexts');
    db.exec('DELETE FROM diagnostic_cases');
    db.exec('DELETE FROM users');
    db.exec('DELETE FROM companies');
    db.pragma('foreign_keys = ON');
  });

  function setupCompanyAndCase() {
    const companyResult = registerCompany({
      companyName: 'Test Corp',
      adminName: 'Admin User',
      adminEmail: 'admin@test.com',
      adminPassword: 'test-password-admin',
    });
    expect(companyResult.success).toBe(true);

    const companyId = companyResult.company!.id;
    const userId = companyResult.user!.id;

    const now = new Date().toISOString();
    const caseId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO diagnostic_cases (id, company_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(caseId, companyId, 'in_progress', now, now);

    return { companyId, caseId, userId };
  }

  describe('saveAreaContext', () => {
    it('debería guardar contexto de un área', () => {
      const { caseId } = setupCompanyAndCase();

      const result = saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'strategy',
        data: { mission: 'Ser líderes', vision: 'Global en 5 años' },
        problems: [{ description: 'Falta de dirección clara', severity: 'high' }],
        opportunities: 'Expansión a nuevos mercados',
        notes: 'Reunión con board pendiente',
      });

      expect(result.success).toBe(true);
    });

    it('debería fallar si el área no es válida', () => {
      const { caseId } = setupCompanyAndCase();

      const result = saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'invalid-area',
        data: {},
        problems: [],
        opportunities: '',
        notes: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Área no válida');
    });

    it('debería actualizar contexto si ya existe para el área', () => {
      const { caseId } = setupCompanyAndCase();

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'operations',
        data: { processes: 'Desorganizados' },
        problems: [],
        opportunities: '',
        notes: 'Primera versión',
      });

      const result = saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'operations',
        data: { processes: 'Documentados' },
        problems: [{ description: 'Cuellos de botella', severity: 'critical' }],
        opportunities: 'Automatización',
        notes: 'Actualizado',
      });

      expect(result.success).toBe(true);

      const ctx = getAreaContext(caseId, 'operations');
      expect(ctx).toBeDefined();
      expect(ctx!.notes).toBe('Actualizado');
      expect(ctx!.problems).toHaveLength(1);
    });
  });

  describe('getDiagnosticSummary', () => {
    it('debería retornar resumen con problemas por área', () => {
      const { caseId } = setupCompanyAndCase();

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'strategy',
        data: {},
        problems: [
          { description: 'Sin plan estratégico', severity: 'critical' },
          { description: 'Competencia creciente', severity: 'medium' },
        ],
        opportunities: '',
        notes: '',
      });

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'finance',
        data: {},
        problems: [
          { description: 'Flujo de caja negativo', severity: 'high' },
        ],
        opportunities: '',
        notes: '',
      });

      const summary = getDiagnosticSummary(caseId);
      expect(summary.areasCompleted).toBe(2);
      expect(summary.totalProblems).toBe(3);
      expect(summary.criticalProblems).toBe(1);
      expect(summary.highProblems).toBe(1);
    });
  });

  describe('calculateAreaScore', () => {
    it('debería retornar 100 si no hay problemas', () => {
      expect(calculateAreaScore([])).toBe(100);
    });

    it('debería restar por severidad', () => {
      const score = calculateAreaScore([
        { description: 'P1', severity: 'critical' },
        { description: 'P2', severity: 'high' },
      ]);
      expect(score).toBe(60); // 100 - 25 - 15
    });

    it('no debería bajar de 0', () => {
      const score = calculateAreaScore([
        { description: 'P1', severity: 'critical' },
        { description: 'P2', severity: 'critical' },
        { description: 'P3', severity: 'critical' },
        { description: 'P4', severity: 'critical' },
        { description: 'P5', severity: 'critical' },
      ]);
      expect(score).toBe(0);
    });
  });

  describe('getExecutiveSummary', () => {
    it('debería retornar resumen ejecutivo con scores', () => {
      const { caseId } = setupCompanyAndCase();

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'strategy',
        data: { mission: 'X' },
        problems: [
          { description: 'Sin plan', severity: 'critical' },
        ],
        opportunities: 'Hacer plan',
        notes: '',
      });

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'finance',
        data: {},
        problems: [
          { description: 'Flujo negativo', severity: 'high' },
          { description: 'Deuda', severity: 'medium' },
        ],
        opportunities: 'Refinanciar',
        notes: '',
      });

      const summary = getExecutiveSummary(caseId);
      expect(summary.areasCompleted).toBe(2);
      expect(summary.totalProblems).toBe(3);
      expect(summary.overallScore).toBeGreaterThan(0);
      expect(summary.areaScores.length).toBe(2);

      const strategyScore = summary.areaScores.find((a) => a.areaKey === 'strategy');
      expect(strategyScore!.score).toBe(75); // 100 - 25

      const financeScore = summary.areaScores.find((a) => a.areaKey === 'finance');
      expect(financeScore!.score).toBe(77); // 100 - 15 - 8
    });

    it('debería listar problemas ordenados por severidad', () => {
      const { caseId } = setupCompanyAndCase();

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'strategy',
        data: {},
        problems: [
          { description: 'Sin plan', severity: 'critical' },
        ],
        opportunities: '',
        notes: '',
      });

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'finance',
        data: {},
        problems: [
          { description: 'Flujo negativo', severity: 'high' },
        ],
        opportunities: '',
        notes: '',
      });

      const summary = getExecutiveSummary(caseId);
      expect(summary.topProblems[0].severity).toBe('critical');
      expect(summary.topProblems[1].severity).toBe('high');
    });
  });

  describe('getCompaniesForSuperadmin', () => {
    it('debería listar empresas con métricas de diagnóstico', () => {
      const { companyId, caseId } = setupCompanyAndCase();

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'strategy',
        data: {},
        problems: [{ description: 'P1', severity: 'critical' }],
        opportunities: '',
        notes: '',
      });

      const companies = getCompaniesForSuperadmin();
      expect(companies.length).toBeGreaterThanOrEqual(1);

      const company = companies.find((c) => c.id === companyId);
      expect(company).toBeDefined();
      expect(company!.areasCompleted).toBe(1);
      expect(company!.totalProblems).toBe(1);
      expect(company!.criticalProblems).toBe(1);
    });
  });

  describe('generateDiagnosticReport', () => {
    it('debería retornar informe completo con datos de empresa y áreas', () => {
      const { companyId, caseId } = setupCompanyAndCase();

      saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'strategy',
        data: { mission: 'Misión X' },
        problems: [{ description: 'Sin plan', severity: 'critical' }],
        opportunities: 'Crecer',
        notes: 'Urgente',
      });

      const report = generateDiagnosticReport(caseId);
      expect(report).toBeDefined();
      expect(report.company.id).toBe(companyId);
      expect(report.caseId).toBe(caseId);
      expect(report.areas.length).toBe(1);
      expect(report.areas[0].areaKey).toBe('strategy');
      expect(report.areas[0].problems).toHaveLength(1);
      expect(report.summary.overallScore).toBe(75);
      expect(report.generatedAt).toBeDefined();
    });

    it('debería retornar null si el caso no existe', () => {
      const report = generateDiagnosticReport('non-existent-case-id');
      expect(report).toBeNull();
    });
  });

  describe('auditAreaContextChange', () => {
    it('debería crear entrada de auditoría', () => {
      const { companyId, caseId, userId } = setupCompanyAndCase();

      const result = saveAreaContext({
        diagnosticCaseId: caseId,
        areaKey: 'strategy',
        data: {},
        problems: [],
        opportunities: '',
        notes: '',
      });
      expect(result.success).toBe(true);

      auditAreaContextChange(
        result.areaContextId,
        caseId,
        companyId,
        userId,
        'Test User',
        'strategy',
        'create'
      );

      const timeline = getTimelineByCompany(companyId);
      expect(timeline.length).toBe(1);
      expect(timeline[0].userName).toBe('Test User');
      expect(timeline[0].action).toBe('create');
      expect(timeline[0].areaKey).toBe('strategy');
    });
  });

  describe('getTimelineByCompany', () => {
    it('debería retornar timeline ordenado por fecha descendente', () => {
      const { companyId, caseId, userId } = setupCompanyAndCase();

      const r1 = saveAreaContext({ diagnosticCaseId: caseId, areaKey: 'strategy', data: {}, problems: [], opportunities: '', notes: '' });
      auditAreaContextChange(r1.areaContextId, caseId, companyId, userId, 'User A', 'strategy', 'create');

      const r2 = saveAreaContext({ diagnosticCaseId: caseId, areaKey: 'finance', data: {}, problems: [], opportunities: '', notes: '' });
      auditAreaContextChange(r2.areaContextId, caseId, companyId, userId, 'User B', 'finance', 'create');

      const timeline = getTimelineByCompany(companyId);
      expect(timeline.length).toBe(2);
      expect(timeline[0].areaKey).toBe('finance'); // más reciente primero
      expect(timeline[1].areaKey).toBe('strategy');
    });
  });

  describe('getTimelineForSuperadmin', () => {
    it('debería retornar timeline de todas las empresas', () => {
      const { companyId, caseId, userId } = setupCompanyAndCase();

      const r1 = saveAreaContext({ diagnosticCaseId: caseId, areaKey: 'strategy', data: {}, problems: [], opportunities: '', notes: '' });
      auditAreaContextChange(r1.areaContextId, caseId, companyId, userId, 'User A', 'strategy', 'create');

      const timeline = getTimelineForSuperadmin();
      expect(timeline.length).toBeGreaterThanOrEqual(1);
      expect(timeline[0].companyName).toBeDefined();
    });
  });
});
