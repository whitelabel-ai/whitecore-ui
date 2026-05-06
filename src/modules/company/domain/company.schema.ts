import { z } from 'zod';

export const CompanyIndustry = [
  'Technology',
  'Finance',
  'Healthcare',
  'Manufacturing',
  'Retail',
  'Education',
  'Consulting',
  'Other',
] as const;

export const CompanySize = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export const companySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'El nombre de la empresa es obligatorio').max(200, 'Máximo 200 caracteres'),
  industry: z.enum(CompanyIndustry, { message: 'Industria no válida' }).optional(),
  size: z.enum(CompanySize, { message: 'Tamaño no válido' }).optional(),
  country: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional(),
});

export type Company = z.infer<typeof companySchema>;
export type CompanyInput = z.infer<typeof companySchema>;
