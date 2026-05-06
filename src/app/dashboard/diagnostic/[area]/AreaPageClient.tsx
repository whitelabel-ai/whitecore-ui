'use client';

import { useState, useTransition } from 'react';
import { saveAreaContextAction } from './actions';
import { useRouter } from 'next/navigation';

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

type Problem = { description: string; severity: string };

export default function AreaPageClient({
  area,
  diagnosticCaseId,
  existingContext,
}: {
  area: string;
  diagnosticCaseId: string;
  existingContext: {
    problems: Problem[];
    opportunities: string;
    notes: string;
  } | null;
}) {
  const [problems, setProblems] = useState<Problem[]>(
    existingContext?.problems.length ? existingContext.problems : [{ description: '', severity: 'high' }]
  );
  const [opportunities, setOpportunities] = useState(existingContext?.opportunities ?? '');
  const [notes, setNotes] = useState(existingContext?.notes ?? '');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function addProblem() {
    setProblems([...problems, { description: '', severity: 'high' }]);
  }

  function updateProblem(index: number, field: keyof Problem, value: string) {
    const next = [...problems];
    next[index] = { ...next[index], [field]: value };
    setProblems(next);
  }

  function removeProblem(index: number) {
    setProblems(problems.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validProblems = problems.filter((p) => p.description.trim() !== '');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('diagnosticCaseId', diagnosticCaseId);
      formData.append('areaKey', area);
      formData.append('data', '{}');
      formData.append('problems', JSON.stringify(validProblems));
      formData.append('opportunities', opportunities);
      formData.append('notes', notes);

      try {
        await saveAreaContextAction(formData);
        router.push('/dashboard/diagnostic');
      } catch (err) {
        alert('Error al guardar: ' + (err as Error).message);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-2">{AREA_LABELS[area]}</h1>
      <p className="text-gray-600 mb-6">Documenta el contexto, problemas y oportunidades de esta área.</p>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Problemas identificados</h2>
          <div className="space-y-3">
            {problems.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={p.description}
                  onChange={(e) => updateProblem(i, 'description', e.target.value)}
                  placeholder="Descripción del problema"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                <select
                  value={p.severity}
                  onChange={(e) => updateProblem(i, 'severity', e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeProblem(i)}
                  className="text-red-600 hover:text-red-800 px-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addProblem}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            + Agregar problema
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Oportunidades</h2>
          <textarea
            value={opportunities}
            onChange={(e) => setOpportunities(e.target.value)}
            rows={4}
            placeholder="¿Qué oportunidades de mejora ves en esta área?"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Notas adicionales</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Cualquier información adicional relevante..."
            data-testid="area-notes"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar contexto'}
        </button>
      </form>
    </div>
  );
}
