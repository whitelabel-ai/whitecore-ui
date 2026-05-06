import { getOrCreateDiagnosticCase } from '../actions';
import { getAreaContextAction } from './actions';
import AreaPageClient from './AreaPageClient';
import { DiagnosticArea } from '@/modules/diagnostic/application/diagnostic.service';
import { notFound } from 'next/navigation';

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;

  if (!DiagnosticArea.includes(area as typeof DiagnosticArea[number])) {
    notFound();
  }

  const diagnosticCase = await getOrCreateDiagnosticCase();
  const existingContext = await getAreaContextAction(diagnosticCase.id, area);

  return (
    <AreaPageClient
      area={area}
      diagnosticCaseId={diagnosticCase.id}
      existingContext={existingContext ?? null}
    />
  );
}
