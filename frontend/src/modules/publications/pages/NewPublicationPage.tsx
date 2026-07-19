import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/shared/components/PageHeader';
import { useToast } from '@/shared/components/ToastProvider';
import { getErrorMessage } from '@/shared/lib/utils';
import { publicationsApi } from '../api/publicationsApi';
import { PublicationForm } from '../components/PublicationForm';
import type { CreatePublicationRequest } from '../types/publicationTypes';

export default function NewPublicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: CreatePublicationRequest) => publicationsApi.create(data),
    onSuccess: (_res, data) => {
      showToast({
        title: data.draft ? 'Borrador guardado' : 'Publicación programada',
        description: 'La publicación quedó registrada.',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      navigate('/publications/scheduled');
    },
    onError: (err: unknown) => {
      showToast({ title: 'Error', description: getErrorMessage(err, 'No se pudo crear la publicación'), variant: 'error' });
    },
  });

  return (
    <div className="max-w-[640px] mx-auto">
      <PageHeader title="Nueva Publicación" subtitle="Crea y programa una publicación para las redes de MANJAU" />
      <PublicationForm
        mode="create"
        submitLabel="Programar publicación"
        isSubmitting={createMutation.isPending}
        onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
      />
    </div>
  );
}
