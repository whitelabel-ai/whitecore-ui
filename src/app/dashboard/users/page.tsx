import { inviteUserAction } from './actions';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'company_admin') {
    redirect('/dashboard');
  }

  const users = db
    .prepare('SELECT id, name, email, role, is_active FROM users WHERE company_id = ?')
    .all(session.user.companyId!) as Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: number;
  }>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Invitar nuevo usuario</h2>
        <form action={inviteUserAction} className="space-y-4 max-w-md" data-testid="invite-form">
          <div>
            <label htmlFor="invite-name" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="invite-name" name="name" type="text" required data-testid="invite-name" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="invite-email" name="email" type="email" required data-testid="invite-email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="invite-password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input id="invite-password" name="password" type="password" required minLength={8} data-testid="invite-password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Invitar usuario
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
