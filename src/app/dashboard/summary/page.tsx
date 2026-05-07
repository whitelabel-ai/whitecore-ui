import { getExecutiveSummaryAction, getDiagnosticReportForExportAction } from './actions';
import Link from 'next/link';
import ExportButtons from './ExportButtons';

const AREA_LABELS: Record<string, string> = {
  general: 'General / Perfil',
  strategy: 'Estrategia & Negocio',
  operations: 'Operaciones & Procesos',
  finance: 'Finanzas & Control',
  technology: 'Tecnología & Sistemas',
  'human-resources': 'RRHH & Cultura',
  'marketing-sales': 'Marketing, Ventas & Clientes',
  legal: 'Legal & Compliance',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

export default async function SummaryPage() {
  const summary = await getExecutiveSummaryAction();
  const reportJson = await getDiagnosticReportForExportAction();

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Resumen Ejecutivo</h1>
        <p className="text-gray-600">Aún no hay un diagnóstico iniciado. Ve a la sección de Diagnóstico para comenzar.</p>
        <Link href="/dashboard/diagnostic" className="mt-4 inline-block text-blue-600 hover:underline">
          Ir a Diagnóstico →
        </Link>
      </div>
    );
  }

  const scoreColor = summary.overallScore >= 80 ? 'text-green-600' : summary.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Resumen Ejecutivo</h1>
        {reportJson && (
          <ExportButtons reportJson={reportJson} companyName={JSON.parse(reportJson).company.name} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Score General</p>
          <p className={`text-3xl font-bold ${scoreColor}`}>{summary.overallScore}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Áreas completadas</p>
          <p className="text-3xl font-bold text-blue-600">{summary.areasCompleted} / 8</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Problemas críticos</p>
          <p className="text-3xl font-bold text-red-600">{summary.criticalProblems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Problemas altos</p>
          <p className="text-3xl font-bold text-orange-600">{summary.highProblems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Score por Área</h2>
          <div className="space-y-3">
            {summary.areaScores.map((area) => (
              <div key={area.areaKey}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{AREA_LABELS[area.areaKey] || area.areaKey}</span>
                  <span className={area.score >= 80 ? 'text-green-600' : area.score >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                    {area.score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${area.score >= 80 ? 'bg-green-500' : area.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${area.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Oportunidades por Área</h2>
          <div className="space-y-3">
            {summary.areaScores.map((area) => (
              <div key={area.areaKey} className="border-l-4 border-blue-400 pl-3">
                <p className="text-sm font-medium text-gray-900">{AREA_LABELS[area.areaKey] || area.areaKey}</p>
                <p className="text-sm text-gray-600">{area.opportunities || 'Sin oportunidades documentadas'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Problemas Prioritarios</h2>
        {summary.topProblems.length === 0 ? (
          <p className="text-gray-500">No se han identificado problemas.</p>
        ) : (
          <div className="space-y-2">
            {summary.topProblems.map((problem, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">{problem.description}</p>
                  <p className="text-xs text-gray-500">{AREA_LABELS[problem.areaKey] || problem.areaKey}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${SEVERITY_COLORS[problem.severity]}`}>
                  {SEVERITY_LABELS[problem.severity]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
