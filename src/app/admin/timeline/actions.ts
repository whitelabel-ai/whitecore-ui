'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getTimelineForSuperadmin } from '@/modules/diagnostic/application/diagnostic.service';
import { redirect } from 'next/navigation';

export async function getSuperadminTimelineData() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return getTimelineForSuperadmin();
}
