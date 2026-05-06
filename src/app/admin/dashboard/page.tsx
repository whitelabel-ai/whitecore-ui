import { getSuperadminDashboardData } from './actions';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'superadmin') {
    redirect('/dashboard');
  }

  const companies = await getSuperadminDashboardData();

  const totalCompanies = companies.length;
  const avgCompletion = totalCompanies > 0
    ? Math.round(companies.reduce((sum, c) => sum + c.areasCompleted, 0) / totalCompanies)
    : 0;
  const totalCritical = companies.reduce((sum, c) => sum + c.criticalProblems, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard de Consultora</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Empresas registradas</p>
          <p className="text-3xl font-bold text-blue-600">{totalCompanies}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Promedio áreas completadas</p>
          <p className="text-3xl font-bold text-purple-600">{avgCompletion} / 8</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Problemas críticos totales</p>
          <p className="text-3xl font-bold text-red-600">{totalCritical}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Áreas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problemas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Críticos</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.industry || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.size || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`font-semibold ${company.areasCompleted === 8 ? 'text-green-600' : 'text-blue-600'}`}>
                    {company.areasCompleted} / 8
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.totalProblems}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {company.criticalProblems > 0 ? (
                    <span className="text-red-600 font-semibold">{company.criticalProblems}</span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay empresas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
