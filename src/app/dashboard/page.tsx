import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

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
    </div>
  );
}
