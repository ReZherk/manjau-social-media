import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { List, CalendarDays, Pencil, Trash2, Check, Eye } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchInput } from '@/shared/components/SearchInput';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { NetworkTag } from '@/shared/components/NetworkTag';
import { useToast } from '@/shared/components/ToastProvider';
import { getErrorMessage } from '@/shared/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { PERMISSIONS } from '@/app/permissions/permissions';
import { cn } from '@/shared/lib/utils';
import { publicationStatusStyle } from '@/shared/lib/catalog';
import { useScheduledPublications } from '../hooks/usePublications';
import { publicationsApi } from '../api/publicationsApi';
import { EditPublicationDialog } from '../components/EditPublicationDialog';
import { MarkPublishedDialog } from '../components/MarkPublishedDialog';
import { PublicationDetailDialog } from '../components/PublicationDetailDialog';
import { PublicationCalendar } from '../components/PublicationCalendar';
import type { PublicationResponse, PublicationFilters, CreatePublicationRequest } from '../types/publicationTypes';

const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function DateBlock({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <div className="min-h-[56px] pr-3.5 flex flex-col items-center justify-center border-r border-border">
      <span className="text-[8px] text-lavender">{MONTHS_SHORT[d.getMonth()]}</span>
      <strong className="my-0.5 font-serif text-lg">{String(d.getDate()).padStart(2, '0')}</strong>
      <small className="text-[8px] text-text-muted">{d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</small>
    </div>
  );
}

export default function ScheduledPublicationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { hasPermission } = useAuth();

  const [filters, setFilters] = useState<PublicationFilters>({ search: '', from: '', to: '', page: 0, size: 10 });
  const [mode, setMode] = useState<'list' | 'calendar'>('list');
  const [editOpen, setEditOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<PublicationResponse | null>(null);

  const canEdit = hasPermission(PERMISSIONS.PUBLICATION_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PUBLICATION_DELETE);
  const canPublish = hasPermission(PERMISSIONS.PUBLICATION_MARK_AS_PUBLISHED);

  const { data, isLoading, isError, refetch } = useScheduledPublications(filters);
  const page = data?.data;
  const items = page?.content ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['publications'] });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreatePublicationRequest }) => publicationsApi.update(id, data),
    onSuccess: () => { showToast({ title: 'Publicación actualizada', variant: 'success' }); setEditOpen(false); setSelected(null); invalidate(); },
    onError: (err: unknown) => showToast({ title: 'Error', description: getErrorMessage(err, 'No se pudo actualizar'), variant: 'error' }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, evidenceLink }: { id: string; evidenceLink: string }) => publicationsApi.publish(id, { evidenceLink }),
    onSuccess: () => { showToast({ title: 'Publicación marcada como realizada', variant: 'success' }); setPublishOpen(false); setSelected(null); invalidate(); },
    onError: (err: unknown) => showToast({ title: 'Error', description: getErrorMessage(err, 'No se pudo marcar como realizada'), variant: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => publicationsApi.remove(id),
    onSuccess: () => { showToast({ title: 'Publicación eliminada', variant: 'success' }); setDeleteOpen(false); setSelected(null); invalidate(); },
    onError: (err: unknown) => showToast({ title: 'Error', description: getErrorMessage(err, 'No se pudo eliminar'), variant: 'error' }),
  });

  const openEdit = (p: PublicationResponse) => { setSelected(p); setEditOpen(true); };
  const openPublish = (p: PublicationResponse) => { setSelected(p); setPublishOpen(true); };
  const openDelete = (p: PublicationResponse) => { setSelected(p); setDeleteOpen(true); };
  const openDetail = (p: PublicationResponse) => { setSelected(p); setDetailOpen(true); };

  return (
    <div>
      <PageHeader
        title="Publicaciones Programadas"
        subtitle={page ? `${page.totalElements} publicaciones pendientes` : 'Consulta y gestiona publicaciones programadas'}
        action={
          <div className="flex gap-2">
            <button onClick={() => setMode('list')} aria-label="Vista lista" className={cn('w-9 h-9 grid place-items-center rounded-xl border', mode === 'list' ? 'text-lavender bg-lavender-soft border-lavender/40' : 'text-text-muted bg-white border-border')}><List className="w-4 h-4" /></button>
            <button onClick={() => setMode('calendar')} aria-label="Vista calendario" className={cn('w-9 h-9 grid place-items-center rounded-xl border', mode === 'calendar' ? 'text-lavender bg-lavender-soft border-lavender/40' : 'text-text-muted bg-white border-border')}><CalendarDays className="w-4 h-4" /></button>
          </div>
        }
      />

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={filters.search} onChange={(v) => setFilters((f) => ({ ...f, search: v, page: 0 }))} placeholder="Buscar por título..." /></div>
        <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 0 }))} className="input-field sm:w-40" aria-label="Desde" />
        <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 0 }))} className="input-field sm:w-40" aria-label="Hasta" />
      </div>

      {isLoading ? (
        <LoadingSkeleton count={4} className="h-20 w-full rounded-2xl mb-3" />
      ) : isError ? (
        <ErrorState message="No se pudieron cargar las publicaciones" onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState title="Sin publicaciones programadas" description="Crea una nueva publicación para empezar." />
      ) : mode === 'calendar' ? (
        <PublicationCalendar publications={items} onSelect={openDetail} />
      ) : (
        <>
          <div className="grid gap-3">
            {items.map((pub) => {
              const status = publicationStatusStyle(pub.status);
              return (
                <article key={pub.id} className="card p-3.5 grid grid-cols-[62px_1fr_auto] items-center gap-4">
                  <DateBlock iso={pub.scheduledAt} />
                  <div className="min-w-0 flex items-center gap-3">
                    {pub.media[0] && !pub.media[0].mediaType?.startsWith('video') && (
                      <img src={pub.media[0].fileUrl} alt="" className="w-11 h-11 rounded-lg object-cover border border-border shrink-0" />
                    )}
                    <div className="min-w-0">
                      <strong className="block text-xs font-semibold truncate">{pub.title}</strong>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {pub.targetAccounts.map((a) => <NetworkTag key={a.id} code={a.platformCode} />)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <span className={cn('badge text-[10px]', status.className)}>{status.label}</span>
                      {pub.budget != null && <small className="text-[8px] text-text-muted">Presupuesto: ${pub.budget}</small>}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => openDetail(pub)} className="w-8 h-8 grid place-items-center rounded-full border border-border text-text-muted hover:bg-soft-pink" aria-label="Ver detalle"><Eye className="w-3.5 h-3.5" /></button>
                      {canEdit && <button onClick={() => openEdit(pub)} className="w-8 h-8 grid place-items-center rounded-full border border-lavender/30 text-lavender hover:bg-lavender-soft" aria-label="Editar"><Pencil className="w-3.5 h-3.5" /></button>}
                      {canDelete && <button onClick={() => openDelete(pub)} className="w-8 h-8 grid place-items-center rounded-full border border-danger/30 text-danger hover:bg-danger/5" aria-label="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>}
                      {canPublish && <button onClick={() => openPublish(pub)} className="w-8 h-8 grid place-items-center rounded-full border border-mint/40 text-mint hover:bg-mint-soft" aria-label="Marcar como realizada"><Check className="w-3.5 h-3.5" /></button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {page && <Pagination page={page.page} totalPages={page.totalPages} totalElements={page.totalElements} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />}
        </>
      )}

      <EditPublicationDialog
        open={editOpen}
        onOpenChange={(o) => { setEditOpen(o); if (!o) setSelected(null); }}
        publication={selected}
        isSubmitting={updateMutation.isPending}
        onSubmit={async (data) => { if (selected) await updateMutation.mutateAsync({ id: selected.id, data }); }}
      />

      <MarkPublishedDialog
        open={publishOpen}
        onOpenChange={(o) => { setPublishOpen(o); if (!o) setSelected(null); }}
        publication={selected}
        isSubmitting={publishMutation.isPending}
        onSubmit={async ({ evidenceLink }) => { if (selected) await publishMutation.mutateAsync({ id: selected.id, evidenceLink }); }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar publicación"
        message="Esta acción eliminará la publicación programada. No se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
      />

      <PublicationDetailDialog
        open={detailOpen}
        onOpenChange={(o) => { setDetailOpen(o); if (!o) setSelected(null); }}
        publication={selected}
      />
    </div>
  );
}
