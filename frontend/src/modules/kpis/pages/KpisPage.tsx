import { PageHeader } from '@/shared/components/PageHeader';
import { TrendingUp } from 'lucide-react';

export default function KpisPage() {
  return (
    <div>
      <PageHeader title="Indicadores KPI" subtitle="Consulta los indicadores clave de rendimiento" />
      <div className="card p-12 flex flex-col items-center justify-center text-text-muted">
        <TrendingUp className="w-12 h-12 mb-3" />
        <p className="font-medium">Módulo de KPI</p>
        <p className="text-sm">Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </div>
  );
}
