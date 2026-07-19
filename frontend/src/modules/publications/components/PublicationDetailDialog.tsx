import { AppDialog } from '@/shared/components/AppDialog';
import { NetworkTag } from '@/shared/components/NetworkTag';
import { cn, formatDateTime } from '@/shared/lib/utils';
import { contentTypeClass, publicationStatusStyle } from '@/shared/lib/catalog';
import type { PublicationResponse } from '../types/publicationTypes';

interface PublicationDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publication: PublicationResponse | null;
}

export function PublicationDetailDialog({ open, onOpenChange, publication }: PublicationDetailDialogProps) {
  const status = publication ? publicationStatusStyle(publication.status) : null;

  return (
    <AppDialog open={open} onOpenChange={onOpenChange} title={publication?.title ?? 'Detalle'} description="Detalle de la publicación">
      {publication && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {status && <span className={cn('badge text-[10px]', status.className)}>{status.label}</span>}
            <span className={cn('badge text-[10px]', contentTypeClass(publication.contentTypeCode))}>{publication.contentTypeName}</span>
            {publication.targetAccounts.map((a) => <NetworkTag key={a.id} code={a.platformCode} />)}
          </div>

          {/* Media gallery */}
          {publication.media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {publication.media.map((m) => (
                <div key={m.id} className="aspect-square rounded-xl overflow-hidden border border-border bg-input-bg">
                  {m.mediaType?.startsWith('video') ? (
                    <video src={m.fileUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer">
                      <img src={m.fileUrl} alt={publication.title} className="w-full h-full object-cover" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div>
              <dt className="text-text-muted mb-0.5">Programada para</dt>
              <dd>{formatDateTime(publication.scheduledAt)}</dd>
            </div>
            {publication.publishedAt && (
              <div>
                <dt className="text-text-muted mb-0.5">Publicada</dt>
                <dd>{formatDateTime(publication.publishedAt)}</dd>
              </div>
            )}
            {publication.budget != null && (
              <div>
                <dt className="text-text-muted mb-0.5">Presupuesto</dt>
                <dd>${publication.budget}</dd>
              </div>
            )}
            {publication.evidenceLink && (
              <div className="col-span-2">
                <dt className="text-text-muted mb-0.5">Evidencia</dt>
                <dd><a href={publication.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-lavender hover:underline break-all">{publication.evidenceLink}</a></dd>
              </div>
            )}
          </dl>

          {publication.description && (
            <div className="text-xs">
              <p className="text-text-muted mb-0.5">Descripción</p>
              <p className="whitespace-pre-wrap">{publication.description}</p>
            </div>
          )}
          {publication.additionalInfo && (
            <div className="text-xs">
              <p className="text-text-muted mb-0.5">Contenido</p>
              <p className="whitespace-pre-wrap">{publication.additionalInfo}</p>
            </div>
          )}
        </div>
      )}
    </AppDialog>
  );
}
