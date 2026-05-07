import { getDiagnosticReportAction } from './actions';
import Link from 'next/link';
import PrintButton from './PrintButton';

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

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-700',
  high: 'text-orange-700',
  medium: 'text-yellow-700',
  low: 'text-green-700',
};

export default async function ReportPage() {
  const report = await getDiagnosticReportAction();

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Informe de Diagnóstico</h1>
        <p className="text-gray-600">No hay un diagnóstico iniciado.</p>
        <Link href="/dashboard/diagnostic" className="mt-4 inline-block text-blue-600 hover:underline">
          Ir a Diagnóstico →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Informe de Diagnóstico Empresarial</h1>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{report.company.name}</p>
              {report.company.industry && <p>Industria: {report.company.industry}</p>}
              {report.company.size && <p>Tamaño: {report.company.size}</p>}
            </div>
            <div className="text-right">
              <p>Generado: {new Date(report.generatedAt).toLocaleDateString()}</p>
              <p>Estado: {report.status}</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen Ejecutivo</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Score General</p>
              <p className={`text-2xl font-bold ${report.summary.overallScore >= 80 ? 'text-green-600' : report.summary.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {report.summary.overallScore}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Áreas Completadas</p>
              <p className="text-2xl font-bold text-blue-600">{report.summary.areasCompleted} / 8</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Problemas Totales</p>
              <p className="text-2xl font-bold text-orange-600">{report.summary.totalProblems}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500">Críticos</p>
              <p className="text-2xl font-bold text-red-600">{report.summary.criticalProblems}</p>
            </div>
          </div>
        </div>

        {/* Areas Detail */}
        <div className="space-y-8 print:space-y-6">
          {report.areas.map((area) => (
            <div key={area.areaKey} className="border-t pt-6 print:pt-4 print:break-inside-avoid">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {AREA_LABELS[area.areaKey] || area.areaKey}
                </h3>
                <span className={`text-xl font-bold ${area.score >= 80 ? 'text-green-600' : area.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {area.score}/100
                </span>
              </div>

              {/* Problems */}
              {area.problems.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Problemas Identificados</h4>
                  <div className="space-y-2">
                    {area.problems.map((problem, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded">
                        <span className="text-sm text-gray-900">{problem.description}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${SEVERITY_COLORS[problem.severity]}`}>
                          {SEVERITY_LABELS[problem.severity]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {area.opportunities && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Oportunidades</h4>
                  <p className="text-sm text-gray-800 bg-green-50 p-3 rounded">{area.opportunities}</p>
                </div>
              )}

              {/* Notes */}
              {area.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Notas</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{area.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-xs text-gray-400 print:mt-8">
          <p>Informe generado por Plataforma de Diagnóstico Empresarial</p>
          <p>{new Date(report.generatedAt).toLocaleString()}</p>
        </div>

        {/* Print Button - hidden when printing */}
        <div className="mt-8 flex justify-center gap-4 print:hidden">
          <PrintButton />
          <Link href="/dashboard/summary" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
            Volver al Resumen
          </Link>
        </div>
      </div>
    </div>
  );
}
