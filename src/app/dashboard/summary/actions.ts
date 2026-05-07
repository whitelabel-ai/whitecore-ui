'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getExecutiveSummary } from '@/modules/diagnostic/application/diagnostic.service';

export async function getExecutiveSummaryAction() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.companyId) {
    throw new Error('No autorizado');
  }

  const companyId = session.user.companyId;

  const caseRow = db.prepare('SELECT id FROM diagnostic_cases WHERE company_id = ? AND status != ?').get(companyId, 'archived') as { id: string } | undefined;

  if (!caseRow) {
    return null;
  }

  return getExecutiveSummary(caseRow.id);
}
