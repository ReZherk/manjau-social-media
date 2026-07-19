import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron registros',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-text-muted">
      <Inbox className="w-12 h-12 mb-3" />
      <p className="font-medium">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  );
}
