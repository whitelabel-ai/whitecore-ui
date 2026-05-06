'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function getOrCreateDiagnosticCase() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.companyId) {
    throw new Error('No autorizado');
  }

  const companyId = session.user.companyId;

  // Buscar caso existente
  let caseRow = db.prepare('SELECT id, status FROM diagnostic_cases WHERE company_id = ? AND status != ?').get(companyId, 'archived') as { id: string; status: string } | undefined;

  if (!caseRow) {
    const now = new Date().toISOString();
    const caseId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO diagnostic_cases (id, company_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(caseId, companyId, 'in_progress', now, now);
    caseRow = { id: caseId, status: 'in_progress' };
  }

  return caseRow;
}
