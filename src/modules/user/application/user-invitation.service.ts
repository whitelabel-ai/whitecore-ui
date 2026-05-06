import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { z } from 'zod';

const invitationSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['company_user']),
});

export type InvitationInput = {
  inviterRole: string;
  inviterCompanyId: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

export type InvitationResult =
  | {
      success: true;
      user: { id: string; email: string; role: string; companyId: string };
    }
  | {
      success: false;
      error: string;
    };

export function inviteUser(input: InvitationInput): InvitationResult {
  if (input.inviterRole !== 'company_admin') {
    return { success: false, error: 'No autorizado: solo los administradores pueden invitar usuarios' };
  }

  if (input.role !== 'company_user') {
    return { success: false, error: 'No puedes crear admins desde esta interfaz' };
  }

  const parsed = invitationSchema.safeParse({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
  });

  if (!parsed.success) {
    return { success: false, error: 'Datos de entrada inválidos' };
  }

  const { name, email, password } = parsed.data;

  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingEmail) {
    return { success: false, error: 'Email ya registrado' };
  }

  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, role, company_id, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, email, name, passwordHash, 'company_user', input.inviterCompanyId, 1, now, now);

  return {
    success: true,
    user: { id: userId, email, role: 'company_user', companyId: input.inviterCompanyId },
  };
}
