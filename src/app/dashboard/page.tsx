import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  let companyName = '';
  if (session.user.companyId) {
    const company = db.prepare('SELECT name FROM companies WHERE id = ?').get(session.user.companyId) as { name: string } | undefined;
    if (company) {
      companyName = company.name;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-700">
        Bienvenido, {session.user.name} ({session.user.email})
      </p>
      {companyName && (
        <p className="mt-2 text-lg font-semibold text-blue-700">{companyName}</p>
      )}
      <p className="mt-2 text-gray-500">Rol: {session.user.role}</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {session.user.role !== 'superadmin' && (
          <>
            <Link href="/dashboard/diagnostic" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <h2 className="text-lg font-semibold text-gray-900">Diagnóstico</h2>
              <p className="text-sm text-gray-600 mt-2">Completar contexto por áreas empresariales.</p>
            </Link>
            <Link href="/dashboard/summary" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <h2 className="text-lg font-semibold text-gray-900">Resumen Ejecutivo</h2>
              <p className="text-sm text-gray-600 mt-2">Ver scoring, problemas prioritarios y oportunidades.</p>
            </Link>
          </>
        )}
        {session.user.role === 'company_admin' && (
          <Link href="/dashboard/users" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-600 mt-2">Invitar y administrar usuarios de la empresa.</p>
          </Link>
        )}
        {session.user.role === 'superadmin' && (
          <Link href="/admin/dashboard" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition border-l-4 border-purple-500">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard Consultora</h2>
            <p className="text-sm text-gray-600 mt-2">Ver estado de todas las empresas registradas.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
