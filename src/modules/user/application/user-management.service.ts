import { db } from '@/lib/db';

export function softDeleteUser(userId: string, companyId: string, requesterRole: string): { success: boolean; error?: string } {
  if (requesterRole !== 'company_admin') {
    return { success: false, error: 'No autorizado' };
  }

  const user = db.prepare('SELECT id, role, company_id FROM users WHERE id = ?').get(userId) as {
    id: string;
    role: string;
    company_id: string;
  } | undefined;

  if (!user) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  if (user.company_id !== companyId) {
    return { success: false, error: 'Usuario no pertenece a tu empresa' };
  }

  if (user.role === 'company_admin') {
    return { success: false, error: 'No puedes eliminar a un admin' };
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?').run(now, userId);

  return { success: true };
}
