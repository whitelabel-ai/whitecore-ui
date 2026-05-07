import { getSuperadminTimelineData } from './actions';

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

const ACTION_LABELS: Record<string, string> = {
  create: 'Creó',
  update: 'Actualizó',
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
};

export default async function AdminTimelinePage() {
  const timeline = await getSuperadminTimelineData();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Timeline Global de Hallazgos</h1>

      {timeline.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">No hay cambios registrados en ninguna empresa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {timeline.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow p-4 flex items-start gap-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${ACTION_COLORS[entry.action]}`}>
                {ACTION_LABELS[entry.action]}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{entry.userName}</span>{' '}
                  {ACTION_LABELS[entry.action].toLowerCase()} el contexto de{' '}
                  <span className="font-medium">{AREA_LABELS[entry.areaKey] || entry.areaKey}</span>{' '}
                  en <span className="font-medium text-blue-700">{entry.companyName}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
