import { describe, it, expect, beforeEach } from 'vitest';
import { registerCompany } from '@/modules/company/application/company-registration.service';
import { db } from '@/lib/db';

describe('Company Registration Service', () => {
  beforeEach(() => {
    db.pragma('foreign_keys = OFF');
    db.exec('DELETE FROM area_contexts');
    db.exec('DELETE FROM diagnostic_cases');
    db.exec('DELETE FROM users');
    db.exec('DELETE FROM companies');
    db.pragma('foreign_keys = ON');
  });

  describe('registerCompany', () => {
    it('debería crear una empresa y un usuario admin', () => {
      const result = registerCompany({
        companyName: 'Acme Corp',
        adminName: 'Juan Pérez',
        adminEmail: 'juan@acme.com',
        adminPassword: 'test-password-admin',
      });

      expect(result.success).toBe(true);
      expect(result.company).toBeDefined();
      expect(result.company.name).toBe('Acme Corp');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('juan@acme.com');
      expect(result.user.role).toBe('company_admin');
      expect(result.user.companyId).toBe(result.company.id);
    });

    it('debería fallar si el email ya está registrado', () => {
      registerCompany({
        companyName: 'Acme Corp',
        adminName: 'Juan Pérez',
        adminEmail: 'juan@acme.com',
        adminPassword: 'test-password-admin',
      });

      const result = registerCompany({
        companyName: 'Beta Corp',
        adminName: 'María López',
        adminEmail: 'juan@acme.com',
        adminPassword: 'test-password-other',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email ya registrado');
    });

    it('debería fallar si el nombre de empresa ya existe', () => {
      registerCompany({
        companyName: 'Acme Corp',
        adminName: 'Juan Pérez',
        adminEmail: 'juan@acme.com',
        adminPassword: 'test-password-admin',
      });

      const result = registerCompany({
        companyName: 'Acme Corp',
        adminName: 'María López',
        adminEmail: 'maria@acme.com',
        adminPassword: 'test-password-other',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Empresa ya existe');
    });

    it('debería hashear el password del admin', () => {
      const result = registerCompany({
        companyName: 'Acme Corp',
        adminName: 'Juan Pérez',
        adminEmail: 'juan@acme.com',
        adminPassword: 'test-password-admin',
      });

      expect(result.success).toBe(true);
      // El password_hash en DB no debe ser el texto plano
      const row = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('juan@acme.com') as { password_hash: string };
      expect(row.password_hash).not.toBe('test-password-admin');
      expect(row.password_hash.length).toBeGreaterThan(20);
    });
  });
});
