import { z } from 'zod';

export const UserRole = ['superadmin', 'company_admin', 'company_user'] as const;

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Email no válido'),
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  passwordHash: z.string().min(1),
  role: z.enum(UserRole, { message: 'Rol no válido' }),
  companyId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserInput = Omit<User, 'id' | 'passwordHash' | 'createdAt' | 'updatedAt'> & {
  password: string;
};
