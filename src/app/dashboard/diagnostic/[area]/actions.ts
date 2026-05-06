'use server';

import { saveAreaContext, getAreaContext, DiagnosticArea } from '@/modules/diagnostic/application/diagnostic.service';
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

  revalidatePath(`/dashboard/diagnostic/${areaKey}`);
  revalidatePath('/dashboard/diagnostic');
}

export async function getAreaContextAction(diagnosticCaseId: string, areaKey: string) {
  return getAreaContext(diagnosticCaseId, areaKey);
}
