import { describe, it, expect, beforeEach } from 'vitest';
import { saveAreaContext, getAreaContext, getDiagnosticSummary } from '@/modules/diagnostic/application/diagnostic.service';
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

    // Crear caso de diagnóstico
    const now = new Date().toISOString();
    const caseId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO diagnostic_cases (id, company_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(caseId, companyId, 'in_progress', now, now);

    return { companyId, caseId };
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
});
