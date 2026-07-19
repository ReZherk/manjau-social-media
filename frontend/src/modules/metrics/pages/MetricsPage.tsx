import { PageHeader } from '@/shared/components/PageHeader';
import { BarChart3 } from 'lucide-react';

export default function MetricsPage() {
  return (
    <div>
      <PageHeader title="Registrar Métricas" subtitle="Ingresa las métricas de las plataformas" />
      <div className="card p-12 flex flex-col items-center justify-center text-text-muted">
        <BarChart3 className="w-12 h-12 mb-3" />
        <p className="font-medium">Módulo de Métricas</p>
        <p className="text-sm">Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  );
}
