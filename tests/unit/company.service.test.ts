import { describe, it, expect } from 'vitest';
import { createCompany, updateCompany, softDeleteCompany, isActive } from '@/modules/company/domain/company.service';

describe('Company Service', () => {
  describe('createCompany', () => {
    it('debería crear una empresa con id y fechas generadas', () => {
      const input = {
        name: 'Acme Corp',
        taxId: '123456789',
        sector: 'Technology' as const,
      };

      const company = createCompany(input);

      expect(company.name).toBe('Acme Corp');
      expect(company.taxId).toBe('123456789');
      expect(company.sector).toBe('Technology');
      expect(company.id).toBeDefined();
      expect(company.createdAt).toBeInstanceOf(Date);
      expect(company.updatedAt).toBeInstanceOf(Date);
      expect(company.deletedAt).toBeUndefined();
    });
  });

  describe('updateCompany', () => {
    it('debería actualizar campos y modificar updatedAt', () => {
      const company = createCompany({ name: 'Acme', taxId: '111', sector: 'Retail' });
      const originalUpdatedAt = company.updatedAt;

      // Esperar un tick para que la fecha cambie
      const updated = updateCompany(company, { name: 'Acme Inc' });

      expect(updated.name).toBe('Acme Inc');
      expect(updated.taxId).toBe('111');
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('softDeleteCompany', () => {
    it('debería marcar deletedAt sin borrar el registro', () => {
      const company = createCompany({ name: 'Acme', taxId: '111', sector: 'Other' });

      const deleted = softDeleteCompany(company);

      expect(deleted.deletedAt).toBeInstanceOf(Date);
      expect(deleted.name).toBe('Acme');
    });
  });

  describe('isActive', () => {
    it('debería retornar true si no tiene deletedAt', () => {
      const company = createCompany({ name: 'Acme', taxId: '111', sector: 'Finance' });
      expect(isActive(company)).toBe(true);
    });

    it('debería retornar false si tiene deletedAt', () => {
      const company = softDeleteCompany(
        createCompany({ name: 'Acme', taxId: '111', sector: 'Healthcare' })
      );
      expect(isActive(company)).toBe(false);
    });
  });
});
