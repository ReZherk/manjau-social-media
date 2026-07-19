import { useState } from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { PublicationDetailDialog } from '../components/PublicationDetailDialog';
import type { PublicationResponse } from '../types/publicationTypes';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchInput } from '@/shared/components/SearchInput';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { NetworkDot } from '@/shared/components/NetworkTag';
import { cn } from '@/shared/lib/utils';
import { formatDate, formatDateTime } from '@/shared/lib/utils';
import { contentTypeClass } from '@/shared/lib/catalog';
import { useHistoryPublications } from '../hooks/usePublications';
import type { PublicationFilters } from '../types/publicationTypes';

export default function HistoryPage() {
  const [filters, setFilters] = useState<PublicationFilters>({ search: '', from: '', to: '', page: 0, size: 10 });
  const [detail, setDetail] = useState<PublicationResponse | null>(null);
  const { data, isLoading, isError, refetch } = useHistoryPublications(filters);
  const page = data?.data;
  const items = page?.content ?? [];

  return (
    <div>
      <PageHeader title="Historial de Publicaciones" subtitle="Registro de todas las publicaciones realizadas" />

      <div className="card p-5 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-lavender-soft text-lavender grid place-items-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <strong className="block font-serif text-2xl text-lavender">{page?.totalElements ?? 0}</strong>
          <span className="text-[11px] text-text-muted">Publicaciones realizadas</span>
        </div>
      </div>

      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={filters.search} onChange={(v) => setFilters((f) => ({ ...f, search: v, page: 0 }))} placeholder="Buscar publicación..." /></div>
        <input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 0 }))} className="input-field sm:w-40" aria-label="Desde" />
        <input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 0 }))} className="input-field sm:w-40" aria-label="Hasta" />
      </div>

      {isLoading ? (
        <LoadingSkeleton count={5} className="h-12 w-full rounded-xl mb-2" />
      ) : isError ? (
        <ErrorState message="No se pudo cargar el historial" onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState title="Sin publicaciones realizadas" description="Aquí aparecerán las publicaciones marcadas como realizadas." />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="text-left text-[10px] text-lavender">
                  <th className="p-3.5 font-medium">PUBLICACIÓN</th>
                  <th className="p-3.5 font-medium">CREACIÓN</th>
                  <th className="p-3.5 font-medium">PUBLICADA</th>
                  <th className="p-3.5 font-medium">REDES</th>
                  <th className="p-3.5 font-medium">TIPO</th>
                  <th className="p-3.5 font-medium">EVIDENCIA</th>
                  <th className="p-3.5 font-medium">ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {items.map((pub) => (
                  <tr key={pub.id} className="border-t border-[#f1e9ed] text-[11px]">
                    <td className="p-3.5">
                      <button onClick={() => setDetail(pub)} className="flex items-center gap-2.5 text-left hover:opacity-80">
                        {pub.media[0] && !pub.media[0].mediaType?.startsWith('video') ? (
                          <img src={pub.media[0].fileUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" />
                        ) : (
                          <span className="w-4 h-4 grid place-items-center rounded-full border border-mint text-mint text-[8px] shrink-0">✓</span>
                        )}
                        <div>
                          <strong className="block text-xs font-semibold">{pub.title}</strong>
                          {pub.budget != null && <small className="text-[9px] text-text-muted">Presupuesto: ${pub.budget}</small>}
                        </div>
                      </button>
                    </td>
                    <td className="p-3.5 text-text-muted">{formatDate(pub.createdAt)}</td>
                    <td className="p-3.5 text-text-muted">{pub.publishedAt ? formatDateTime(pub.publishedAt) : '—'}</td>
                    <td className="p-3.5"><div className="flex gap-1">{pub.targetAccounts.map((a) => <NetworkDot key={a.id} code={a.platformCode} />)}</div></td>
                    <td className="p-3.5"><span className={cn('badge text-[9px]', contentTypeClass(pub.contentTypeCode))}>{pub.contentTypeName}</span></td>
                    <td className="p-3.5">
                      {pub.evidenceLink ? (
                        <a href={pub.evidenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-lavender hover:underline">
                          Ver <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : '—'}
                    </td>
                    <td className="p-3.5"><span className="badge text-[10px] text-mint bg-mint-soft">Realizada</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {page && <Pagination page={page.page} totalPages={page.totalPages} totalElements={page.totalElements} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />}
        </>
      )}

      <PublicationDetailDialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null); }} publication={detail} />
    </div>
  );
}
