import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppDialog } from '@/shared/components/AppDialog';
import type { MetricPublication } from '../types/metricTypes';
import { metricSchema, type MetricFormData } from '../schemas/metricSchemas';

export function MetricDialog({ row, open, onOpenChange, onSubmit, loading }: { row: MetricPublication | null; open:boolean; onOpenChange:(v:boolean)=>void; onSubmit:(v:MetricFormData)=>Promise<void>; loading:boolean }) {
  const { register, handleSubmit, reset, formState:{errors} } = useForm<MetricFormData>({ resolver:zodResolver(metricSchema) });
  useEffect(() => { if(row) reset({ reactions:row.reactions, reach:row.reach, saves:row.saves, shares:row.shares, comments:row.comments }); }, [row, reset]);
  if (!row) return null;
  return <AppDialog open={open} onOpenChange={onOpenChange} title={row.metricId ? 'Editar métricas' : 'Registrar métricas'} description="Completa los resultados obtenidos por la publicación" className="max-w-[680px]">
    <div className="rounded-2xl bg-pink-soft/60 border border-pink/15 p-4 mb-5 grid sm:grid-cols-2 gap-3 text-sm">
      <div><span className="text-text-muted text-xs">Publicación</span><strong className="block mt-1">{row.title}</strong></div>
      <div><span className="text-text-muted text-xs">Plataforma</span><strong className="block mt-1">{row.platformName} · {row.accountName}</strong></div>
      <div><span className="text-text-muted text-xs">Tipo de contenido</span><strong className="block mt-1">{row.contentTypeName}</strong></div>
      <div><span className="text-text-muted text-xs">Presupuesto</span><strong className="block mt-1">S/ {Number(row.budget || 0).toFixed(2)}</strong></div>
    </div>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid sm:grid-cols-2 gap-4">
        {([['reactions','Reacciones *'],['reach','Alcance'],['saves','Guardados'],['shares','Compartidos'],['comments','Comentarios']] as const).map(([name,label]) => <label key={name} className="text-sm text-text-muted">{label}<input type="number" min="0" className="input-field mt-1.5" {...register(name)} />{errors[name] && <span className="text-danger text-xs">Ingresa un valor válido</span>}</label>)}
      </div>
      <div className="flex justify-end gap-3 mt-6"><button type="button" className="btn-secondary" onClick={()=>onOpenChange(false)}>Cancelar</button><button className="btn-primary" disabled={loading}>{loading?'Guardando…':row.metricId?'Guardar cambios':'Registrar métricas'}</button></div>
    </form>
  </AppDialog>;
}
