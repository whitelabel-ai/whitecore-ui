import { getOrCreateDiagnosticCase } from './actions';
import { getAreaContext, getDiagnosticSummary, DiagnosticArea } from '@/modules/diagnostic/application/diagnostic.service';
import Link from 'next/link';

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

export default async function DiagnosticPage() {
  const diagnosticCase = await getOrCreateDiagnosticCase();
  const summary = getDiagnosticSummary(diagnosticCase.id);

  const areaStatuses = DiagnosticArea.map((area) => {
    const ctx = getAreaContext(diagnosticCase.id, area);
    return {
      key: area,
      label: AREA_LABELS[area],
      completed: !!ctx,
      problemCount: ctx ? ctx.problems.length : 0,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-2">Diagnóstico Empresarial</h1>
      <p className="text-gray-600 mb-6">Completa el contexto de cada área para generar el informe.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Áreas completadas</p>
          <p className="text-2xl font-bold text-blue-600">{summary.areasCompleted} / {DiagnosticArea.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Problemas totales</p>
          <p className="text-2xl font-bold text-orange-600">{summary.totalProblems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Críticos</p>
          <p className="text-2xl font-bold text-red-600">{summary.criticalProblems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Altos</p>
          <p className="text-2xl font-bold text-yellow-600">{summary.highProblems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areaStatuses.map((area) => (
          <Link
            key={area.key}
            href={`/dashboard/diagnostic/${area.key}`}
            className={`block rounded-lg shadow p-6 transition hover:shadow-md ${
              area.completed ? 'bg-white border-l-4 border-green-500' : 'bg-white border-l-4 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{area.label}</h3>
              {area.completed ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Completado</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Pendiente</span>
              )}
            </div>
            {area.problemCount > 0 && (
              <p className="text-sm text-orange-600">{area.problemCount} problema(s) identificado(s)</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
