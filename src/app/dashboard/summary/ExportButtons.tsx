'use client';

import Link from 'next/link';

interface ExportButtonsProps {
  reportJson: string;
  companyName: string;
}

export default function ExportButtons({ reportJson, companyName }: ExportButtonsProps) {
  function handleDownloadJson() {
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostico-${companyName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDownloadJson}
        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
      >
        Descargar JSON
      </button>
      <Link
        href="/dashboard/report"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
      >
        Ver Informe Imprimible
      </Link>
    </div>
  );
}
