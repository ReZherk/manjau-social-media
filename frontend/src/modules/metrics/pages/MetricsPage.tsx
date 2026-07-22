import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Edit3, Eraser, Search } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Pagination } from '@/shared/components/Pagination';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { useToast } from '@/shared/components/ToastProvider';
import { getErrorMessage } from '@/shared/lib/utils';
import { NetworkTag } from '@/shared/components/NetworkTag';
import { useMetrics } from '../hooks/useMetrics';
import { metricsApi } from '../api/metricsApi';
import { MetricDialog } from '../components/MetricDialog';
import type { MetricFilters, MetricPublication } from '../types/metricTypes';
import type { MetricFormData } from '../schemas/metricSchemas';
import { usePlatforms } from '@/shared/hooks/useReference';

const initial: MetricFilters = { search:'', from:'', to:'', status:'', platform:'', page:0, size:8 };
export default function MetricsPage() {
  const [filters,setFilters]=useState(initial); const [selected,setSelected]=useState<MetricPublication|null>(null);
  const query=useMetrics(filters); const qc=useQueryClient(); const {showToast}=useToast();
  const platforms=usePlatforms().data?.data??[];
  const mutation=useMutation({ mutationFn:({row,data}:{row:MetricPublication;data:MetricFormData}) => {
    const payload={publicationId:row.publicationId,socialAccountId:row.socialAccountId,...data};
    return row.metricId ? metricsApi.update(row.metricId,payload) : metricsApi.create(payload);
  }, onSuccess:()=>{qc.invalidateQueries({queryKey:['metrics']});qc.invalidateQueries({queryKey:['analyst-dashboard']});setSelected(null);showToast({title:'Métricas guardadas',description:'El rendimiento de la publicación fue actualizado.',variant:'success'});},
  onError:(e)=>showToast({title:'No se pudo guardar',description:getErrorMessage(e),variant:'error'}) });
  const rows=query.data?.data.content??[];
  return <div><PageHeader title="Registrar métricas" subtitle="Ingresa el rendimiento obtenido por cada publicación realizada y plataforma" />
    <section className="card p-5 mb-6 grid md:grid-cols-2 xl:grid-cols-5 gap-3">
      <label className="relative xl:col-span-2"><Search className="absolute left-3 top-3 w-4 h-4 text-text-muted"/><input className="input-field pl-10" placeholder="Buscar publicación realizada" value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value,page:0}))}/></label>
      <input aria-label="Desde" type="date" className="input-field" value={filters.from} onChange={e=>setFilters(f=>({...f,from:e.target.value,page:0}))}/>
      <input aria-label="Hasta" type="date" className="input-field" value={filters.to} onChange={e=>setFilters(f=>({...f,to:e.target.value,page:0}))}/>
      <select className="input-field" value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value,page:0}))}><option value="">Todos los estados</option><option value="PENDING">Pendiente</option><option value="REGISTERED">Registrado</option></select>
      <select className="input-field" value={filters.platform} onChange={e=>setFilters(f=>({...f,platform:e.target.value,page:0}))}><option value="">Todas las plataformas</option>{platforms.map(p=><option key={p.id} value={p.code}>{p.name}</option>)}</select>
      <button className="btn-secondary md:col-start-2 xl:col-start-5" onClick={()=>setFilters(initial)}><Eraser className="w-4 h-4"/>Limpiar filtros</button>
    </section>
    {query.isLoading?<LoadingSkeleton count={5} className="h-24 mb-3"/>:query.isError?<ErrorState onRetry={()=>query.refetch()}/>:rows.length===0?<EmptyState title="No se encontraron publicaciones" description="Solo aparecen publicaciones marcadas como realizadas."/>:<div className="grid gap-3">{rows.map(row=><article key={`${row.publicationId}-${row.socialAccountId}`} className="card px-5 py-4 grid grid-cols-[64px_1fr] md:grid-cols-[72px_1fr_auto] items-center gap-4 hover:shadow-soft transition-shadow">
      <div className="h-16 rounded-2xl bg-lavender-soft text-lavender grid place-items-center text-center"><CalendarDays className="w-5 h-5"/><span className="text-[10px] -mt-3">{new Date(row.publishedAt).toLocaleDateString('es-PE',{day:'2-digit',month:'short'})}</span></div>
      <div className="min-w-0"><strong className="block text-base truncate">{row.title}</strong><div className="flex flex-wrap items-center gap-2 mt-2"><NetworkTag code={row.platformCode}/><span className="text-xs text-text-muted">{row.accountName}</span><span className={`badge ${row.metricId?'bg-mint-soft text-mint':'bg-peach-soft text-peach'}`}>{row.metricId?'Registrado':'Pendiente'}</span></div></div>
      <button className={`md:col-auto col-start-2 justify-self-start md:justify-self-end ${row.metricId?'btn-outline':'btn-primary'}`} onClick={()=>setSelected(row)}>{row.metricId?'Editar métricas':'Registrar métricas'}<Edit3 className="w-4 h-4"/></button>
    </article>)}</div>}
    {query.data?.data&&<Pagination page={query.data.data.page} totalPages={query.data.data.totalPages} totalElements={query.data.data.totalElements} onPageChange={page=>setFilters(f=>({...f,page}))}/>}
    <MetricDialog row={selected} open={!!selected} onOpenChange={o=>!o&&setSelected(null)} loading={mutation.isPending} onSubmit={async data=>{if(selected)await mutation.mutateAsync({row:selected,data})}}/>
  </div>;
}
