'use server';

import { saveAreaContext, getAreaContext, DiagnosticArea, auditAreaContextChange } from '@/modules/diagnostic/application/diagnostic.service';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function saveAreaContextAction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.companyId) {
    throw new Error('No autorizado');
  }

  const diagnosticCaseId = formData.get('diagnosticCaseId') as string;
  const areaKeyRaw = formData.get('areaKey') as string;
  const dataJson = formData.get('data') as string;
  const problemsJson = formData.get('problems') as string;
  const opportunities = formData.get('opportunities') as string;
  const notes = formData.get('notes') as string;

  const areaKey = DiagnosticArea.find((a) => a === areaKeyRaw);
  if (!areaKey) {
    throw new Error('Área no válida');
  }

  const result = saveAreaContext({
    diagnosticCaseId,
    areaKey,
    data: JSON.parse(dataJson || '{}'),
    problems: JSON.parse(problemsJson || '[]'),
    opportunities,
    notes,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  // Audit log
  const caseRow = db.prepare('SELECT company_id FROM diagnostic_cases WHERE id = ?').get(diagnosticCaseId) as { company_id: string } | undefined;
  if (caseRow) {
    auditAreaContextChange(
      result.areaContextId,
      diagnosticCaseId,
      caseRow.company_id,
      session.user.id as string,
      session.user.name || 'Usuario',
      areaKey,
      result.action
    );
  }

  revalidatePath(`/dashboard/diagnostic/${areaKey}`);
  revalidatePath('/dashboard/diagnostic');
}

export async function getAreaContextAction(diagnosticCaseId: string, areaKey: string) {
  return getAreaContext(diagnosticCaseId, areaKey);
}
