import { type Company, type CompanyInput } from './company.schema';

export function createCompany(input: CompanyInput): Company {
  const now = new Date();
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCompany(company: Company, changes: Partial<CompanyInput>): Company {
  return {
    ...company,
    ...changes,
    updatedAt: new Date(),
  };
}

export function softDeleteCompany(company: Company): Company {
  return {
    ...company,
    deletedAt: new Date(),
    updatedAt: new Date(),
  };
}

export function isActive(company: Company): boolean {
  return company.deletedAt === undefined || company.deletedAt === null;
}
