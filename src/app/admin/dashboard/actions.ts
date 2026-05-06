'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCompaniesForSuperadmin } from '@/modules/diagnostic/application/diagnostic.service';

export async function getSuperadminDashboardData() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'superadmin') {
    throw new Error('No autorizado');
  }

  return getCompaniesForSuperadmin();
}
