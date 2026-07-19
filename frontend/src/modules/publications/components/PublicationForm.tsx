import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Calendar, Clock, DollarSign, ImagePlus, X, Film } from 'lucide-react';
import { useContentTypes } from '@/shared/hooks/useReference';
import { useSocialAccounts } from '@/modules/social-accounts/hooks/useSocialAccounts';
import { mediaApi } from '@/shared/api/mediaApi';
import { useToast } from '@/shared/components/ToastProvider';
import { getErrorMessage } from '@/shared/lib/utils';
import { platformStyle } from '@/shared/lib/catalog';
import { cn } from '@/shared/lib/utils';
import type { ReferenceItem } from '@/shared/api/referenceApi';
import { publicationFormSchema, type PublicationFormData } from '../schemas/publicationSchemas';
import type { CreatePublicationRequest, MediaInput, PublicationResponse } from '../types/publicationTypes';

interface PublicationFormProps {
  initial?: PublicationResponse | null;
  mode: 'create' | 'edit';
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (data: CreatePublicationRequest) => Promise<void>;
  onCancel?: () => void;
}

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima';
const TIME_ZONES = Array.from(new Set([BROWSER_TZ, 'America/Lima', 'America/Bogota', 'America/Mexico_City']));

/** UTC instant (ISO) for a wall-clock date+time in a given IANA timezone. */
function zonedWallTimeToUtcIso(date: string, time: string, timeZone: string): string {
  const [yStr, moStr, dStr] = date.split('-');
  const [hStr, miStr] = time.split(':');
  const t0 = Date.UTC(Number(yStr), Number(moStr) - 1, Number(dStr), Number(hStr), Number(miStr), 0);
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(t0))) if (p.type !== 'literal') map[p.type] = p.value;
  const asSeenUtc = Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day), Number(map.hour), Number(map.minute), Number(map.second));
  return new Date(t0 - (asSeenUtc - t0)).toISOString();
}

function toDefaults(pub?: PublicationResponse | null): PublicationFormData {
  const pad = (n: number) => String(n).padStart(2, '0');
  if (!pub) {
    return { title: '', description: '', additionalInfo: '', contentTypeCode: '', budget: '', date: '', time: '', timeZone: BROWSER_TZ, socialAccountIds: [] };
  }
  const d = new Date(pub.scheduledAt);
  return {
    title: pub.title,
    description: pub.description ?? '',
    additionalInfo: pub.additionalInfo ?? '',
    contentTypeCode: pub.contentTypeCode,
    budget: pub.budget != null ? String(pub.budget) : '',
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    timeZone: BROWSER_TZ,
    socialAccountIds: pub.targetAccounts.map((a) => a.id),
  };
}

export function PublicationForm({ initial, mode, submitLabel, isSubmitting, onSubmit, onCancel }: PublicationFormProps) {
  const { showToast } = useToast();
  const { data: contentTypes } = useContentTypes();
  const { data: accountsData } = useSocialAccounts({ search: '', platform: '', status: 'ACTIVE', page: 0, size: 100 });
  const accounts = accountsData?.data.content ?? [];

  const [media, setMedia] = useState<MediaInput[]>(
    initial?.media.map((m) => ({ fileUrl: m.fileUrl, mediaType: m.mediaType ?? undefined })) ?? [],
  );
  const [uploading, setUploading] = useState(0);
  const draftRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PublicationFormData>({
    resolver: zodResolver(publicationFormSchema),
    defaultValues: toDefaults(initial),
  });

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading((n) => n + files.length);
    for (const file of Array.from(files)) {
      try {
        const res = await mediaApi.upload(file);
        setMedia((prev) => [...prev, { fileUrl: res.data.fileUrl, mediaType: res.data.mediaType ?? undefined }]);
      } catch (err) {
        showToast({ title: 'Error al subir', description: getErrorMessage(err, `No se pudo subir ${file.name}`), variant: 'error' });
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (url: string) => setMedia((prev) => prev.filter((m) => m.fileUrl !== url));

  const submit = handleSubmit(async (form) => {
    const request: CreatePublicationRequest = {
      title: form.title.trim(),
      description: form.description || undefined,
      additionalInfo: form.additionalInfo || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      contentTypeCode: form.contentTypeCode,
      scheduledAt: zonedWallTimeToUtcIso(form.date, form.time, form.timeZone),
      socialAccountIds: form.socialAccountIds,
      media: media.length ? media : undefined,
      draft: draftRef.current,
    };
    await onSubmit(request);
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Content */}
      <section className="card p-5">
        <h2 className="text-sm font-medium mb-4">Información del contenido</h2>

        <label className="block text-xs text-text-muted mb-1.5">Título *</label>
        <input {...register('title')} placeholder="Ej. Torta de fresas — edición especial" className="input-field mb-1" />
        {errors.title && <p className="text-danger text-xs mb-3">{errors.title.message}</p>}

        <label className="block text-xs text-text-muted mb-1.5 mt-3">Descripción / Caption</label>
        <textarea {...register('description')} rows={3} placeholder="Escribe el texto que acompañará la publicación..." className="input-field mb-3" />

        <label className="block text-xs text-text-muted mb-1.5">Contenido / Texto principal</label>
        <textarea {...register('additionalInfo')} rows={2} placeholder="Hashtags, menciones, links o notas adicionales..." className="input-field mb-3" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Tipo de contenido</label>
            <select {...register('contentTypeCode')} className="input-field">
              <option value="">Selecciona un tipo</option>
              {contentTypes?.data.map((c: ReferenceItem) => (
                <option key={c.id} value={c.code}>{c.name}</option>
              ))}
            </select>
            {errors.contentTypeCode && <p className="text-danger text-xs mt-1">{errors.contentTypeCode.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5"><DollarSign className="w-3 h-3 inline" /> Presupuesto (COP)</label>
            <input {...register('budget')} type="number" min="0" step="0.01" placeholder="0" className="input-field" />
            {errors.budget && <p className="text-danger text-xs mt-1">{errors.budget.message}</p>}
          </div>
        </div>

        {/* Media dropzone */}
        <label className="block text-xs text-text-muted mb-1.5 mt-3">Imágenes / Video</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); uploadFiles(e.dataTransfer.files); }}
          className="w-full min-h-[110px] flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-lavender/40 bg-white text-lavender hover:bg-lavender-soft/30 transition-colors"
        >
          {uploading > 0 ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
          <strong className="text-[11px] font-medium">{uploading > 0 ? 'Subiendo...' : 'Arrastra imágenes o haz clic para seleccionar'}</strong>
          <small className="text-[10px] text-text-muted">PNG, JPG, MP4 · máx. 50MB</small>
        </button>

        {media.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
            {media.map((m) => (
              <div key={m.fileUrl} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-input-bg">
                {m.mediaType?.startsWith('video') ? (
                  <div className="w-full h-full grid place-items-center text-text-muted"><Film className="w-6 h-6" /></div>
                ) : (
                  <img src={m.fileUrl} alt="Vista previa" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(m.fileUrl)}
                  className="absolute top-1 right-1 w-5 h-5 grid place-items-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Quitar archivo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Networks */}
      <section className="card p-5">
        <h2 className="text-sm font-medium mb-1">Redes sociales *</h2>
        <p className="text-[11px] text-text-muted mb-4">Selecciona dónde se publicará este contenido</p>
        {accounts.length === 0 ? (
          <p className="text-xs text-text-muted">No hay cuentas activas. Registra una en «Redes Sociales».</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((account) => {
              const style = platformStyle(account.platformCode);
              return (
                <label key={account.id} className="flex items-center gap-2.5 min-h-[44px] px-3 rounded-lg border border-border bg-white cursor-pointer text-xs hover:border-lavender/50 transition-colors">
                  <input type="checkbox" value={account.id} {...register('socialAccountIds')} className="w-3.5 h-3.5 accent-lavender" />
                  <span className={cn('badge text-[9px]', style.tagClass)}>{style.label}</span>
                  <span className="truncate text-text-muted">{account.accountName}</span>
                </label>
              );
            })}
          </div>
        )}
        {errors.socialAccountIds && <p className="text-danger text-xs mt-2">{errors.socialAccountIds.message}</p>}
      </section>

      {/* Schedule */}
      <section className="card p-5">
        <h2 className="text-sm font-medium mb-1">Programación *</h2>
        <p className="text-[11px] text-text-muted mb-4">Define cuándo se publicará este contenido</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-text-muted mb-1.5"><Calendar className="w-3 h-3 inline" /> Fecha *</label>
            <input {...register('date')} type="date" className="input-field" />
            {errors.date && <p className="text-danger text-xs mt-1">{errors.date.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5"><Clock className="w-3 h-3 inline" /> Hora *</label>
            <input {...register('time')} type="time" className="input-field" />
            {errors.time && <p className="text-danger text-xs mt-1">{errors.time.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Zona horaria</label>
            <select {...register('timeZone')} className="input-field">
              {TIME_ZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        {mode === 'edit' ? (
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSubmitting}>Cancelar</button>
        ) : (
          <button type="submit" onClick={() => { draftRef.current = true; }} className="btn-secondary" disabled={isSubmitting || uploading > 0}>
            Guardar como borrador
          </button>
        )}
        <button type="submit" onClick={() => { draftRef.current = false; }} className="btn-primary" disabled={isSubmitting || uploading > 0}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
