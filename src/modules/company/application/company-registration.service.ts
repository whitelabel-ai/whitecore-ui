import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { z } from 'zod';

const registrationSchema = z.object({
  companyName: z.string().min(1).max(200),
  adminName: z.string().min(1).max(200),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationResult =
  | {
      success: true;
      company: { id: string; name: string };
      user: { id: string; email: string; role: string; companyId: string | null };
    }
  | {
      success: false;
      error: string;
    };

export function registerCompany(input: RegistrationInput): RegistrationResult {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Datos de entrada inválidos' };
  }

  const { companyName, adminName, adminEmail, adminPassword } = parsed.data;

  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (existingEmail) {
    return { success: false, error: 'Email ya registrado' };
  }

  const existingCompany = db.prepare('SELECT id FROM companies WHERE name = ?').get(companyName);
  if (existingCompany) {
    return { success: false, error: 'Empresa ya existe' };
  }

  const now = new Date().toISOString();
  const companyId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  const insertCompany = db.prepare(`
    INSERT INTO companies (id, name, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, password_hash, role, company_id, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertCompany.run(companyId, companyName, now, now);
    insertUser.run(userId, adminEmail, adminName, passwordHash, 'company_admin', companyId, 1, now, now);
  });

  transaction();

  return {
    success: true,
    company: { id: companyId, name: companyName },
    user: { id: userId, email: adminEmail, role: 'company_admin', companyId },
  };
}
