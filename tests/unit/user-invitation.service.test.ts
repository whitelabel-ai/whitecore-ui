import { describe, it, expect, beforeEach } from 'vitest';
import { inviteUser } from '@/modules/user/application/user-invitation.service';
import { registerCompany } from '@/modules/company/application/company-registration.service';
import { db } from '@/lib/db';

describe.sequential('User Invitation Service', () => {
  beforeEach(() => {
    db.pragma('foreign_keys = OFF');
    db.exec('DELETE FROM users');
    db.exec('DELETE FROM companies');
    db.pragma('foreign_keys = ON');
  });

  function setupCompany() {
    return registerCompany({
      companyName: 'Test Corp',
      adminName: 'Admin User',
      adminEmail: 'admin@test.com',
      adminPassword: 'test-password-admin',
    });
  }

  describe('inviteUser', () => {
    it('debería crear un usuario company_user vinculado a la misma empresa', () => {
      const companyResult = setupCompany();
      expect(companyResult.success).toBe(true);
      const companyId = companyResult.company!.id;

      const result = inviteUser({
        inviterRole: 'company_admin',
        inviterCompanyId: companyId,
        name: 'María López',
        email: 'maria@test.com',
        password: 'test-password-user',
        role: 'company_user',
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user!.email).toBe('maria@test.com');
      expect(result.user!.role).toBe('company_user');
      expect(result.user!.companyId).toBe(companyId);
    });

    it('debería fallar si el invitador no es company_admin', () => {
      const companyResult = setupCompany();
      const companyId = companyResult.company!.id;

      const result = inviteUser({
        inviterRole: 'company_user',
        inviterCompanyId: companyId,
        name: 'María López',
        email: 'maria@test.com',
        password: 'test-password-user',
        role: 'company_user',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No autorizado');
    });

    it('debería fallar si el email ya está registrado', () => {
      const companyResult = setupCompany();
      const companyId = companyResult.company!.id;

      inviteUser({
        inviterRole: 'company_admin',
        inviterCompanyId: companyId,
        name: 'María López',
        email: 'maria@test.com',
        password: 'test-password-user',
        role: 'company_user',
      });

      const result = inviteUser({
        inviterRole: 'company_admin',
        inviterCompanyId: companyId,
        name: 'Otra María',
        email: 'maria@test.com',
        password: 'test-password-other',
        role: 'company_user',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email ya registrado');
    });

    it('debería fallar si se intenta invitar a un company_admin', () => {
      const companyResult = setupCompany();
      const companyId = companyResult.company!.id;

      const result = inviteUser({
        inviterRole: 'company_admin',
        inviterCompanyId: companyId,
        name: 'Otro Admin',
        email: 'otroadmin@test.com',
        password: 'test-password-short',
        role: 'company_admin',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No puedes crear admins');
    });

    it('debería hashear el password del usuario invitado', () => {
      const companyResult = setupCompany();
      const companyId = companyResult.company!.id;

      const result = inviteUser({
        inviterRole: 'company_admin',
        inviterCompanyId: companyId,
        name: 'María López',
        email: 'maria@test.com',
        password: 'test-password-user',
        role: 'company_user',
      });

      expect(result.success).toBe(true);
      const row = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('maria@test.com') as { password_hash: string };
      expect(row.password_hash).not.toBe('test-password-user');
      expect(row.password_hash.length).toBeGreaterThan(20);
    });
  });
});
