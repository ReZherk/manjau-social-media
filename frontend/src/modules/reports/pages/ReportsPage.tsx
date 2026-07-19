import { PageHeader } from '@/shared/components/PageHeader';
import { FileBarChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reportes" subtitle="Genera reportes PDF del sistema" />
      <div className="card p-12 flex flex-col items-center justify-center text-text-muted">
        <FileBarChart className="w-12 h-12 mb-3" />
        <p className="font-medium">Módulo de Reportes</p>
        <p className="text-sm">Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  );
}
