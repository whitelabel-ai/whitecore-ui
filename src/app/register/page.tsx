'use client';

import { registerCompanyAction } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await registerCompanyAction(formData);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Registrar Empresa</h1>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Nombre de la empresa
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
              Nombre del administrador
            </label>
            <input
              id="adminName"
              name="adminName"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="adminEmail"
              name="adminEmail"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="adminPassword"
              name="adminPassword"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}
