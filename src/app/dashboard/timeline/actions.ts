'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getTimelineByCompany } from '@/modules/diagnostic/application/diagnostic.service';
import { db } from '@/lib/db';

export async function getTimelineAction() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.companyId) {
    throw new Error('No autorizado');
  }

  return getTimelineByCompany(session.user.companyId);
}
