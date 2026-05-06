'use server';

import { registerCompany } from '@/modules/company/application/company-registration.service';

export async function registerCompanyAction(formData: FormData) {
  const companyName = formData.get('companyName') as string;
  const adminName = formData.get('adminName') as string;
  const adminEmail = formData.get('adminEmail') as string;
  const adminPassword = formData.get('adminPassword') as string;

  const result = registerCompany({
    companyName,
    adminName,
    adminEmail,
    adminPassword,
  });

  return result;
}
