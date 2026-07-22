import { Link } from 'react-router-dom';
import { BarChart3, FileBarChart, KeyRound, Target, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';
import { useAuth } from '@/app/providers/AuthProvider';
import { useAnalystDashboard } from '@/modules/metrics/hooks/useMetrics';

export default function AnalystDashboardPage(){const {user}=useAuth();const q=useAnalystDashboard();
 const cards=[{label:'Redes con credenciales',value:q.data?.socialAccounts??0,icon:KeyRound,tone:'bg-pink-soft text-pink'},{label:'Métricas registradas',value:q.data?.registeredMetrics??0,icon:BarChart3,tone:'bg-blue-soft text-blue'},{label:'Registros pendientes',value:q.data?.pendingMetrics??0,icon:Target,tone:'bg-peach-soft text-peach'}];
 return <div><PageHeader title="Dashboard" subtitle="Resumen de las actividades del Analista de Marketing"/>
 <section className="mb-7 min-h-[190px] rounded-3xl border border-pink/15 bg-gradient-to-br from-[#fff1f5] to-[#f4ecff] p-7 sm:p-9 flex items-center justify-between gap-8"><div><span className="text-xs uppercase tracking-widest font-semibold text-pink">Resumen general</span><h2 className="text-3xl mt-3">Hola, {user?.fullName.split(' ')[0]}</h2><p className="text-text-muted mt-3 max-w-2xl">Consulta credenciales, registra el rendimiento de las publicaciones y genera reportes para tomar mejores decisiones.</p></div><div className="hidden sm:grid w-24 h-24 rounded-full border-[10px] border-white/80 bg-blue text-white place-items-center text-2xl font-bold">{user?.initials}</div></section>
 {q.isLoading?<LoadingSkeleton count={3} className="h-28"/>:q.isError?<ErrorState onRetry={()=>q.refetch()}/>:<div className="grid sm:grid-cols-3 gap-5 mb-7">{cards.map(({label,value,icon:Icon,tone})=><article className="card p-6 flex items-center gap-5" key={label}><div className={`w-13 h-13 p-3.5 rounded-2xl ${tone}`}><Icon/></div><div><strong className="text-3xl font-serif">{value}</strong><span className="block text-xs text-text-muted mt-1">{label}</span></div></article>)}</div>}
 <section className="card p-6"><h2 className="text-lg mb-5">Accesos rápidos</h2><div className="grid md:grid-cols-3 gap-4">{[
   {Icon:KeyRound,label:'Consultar credenciales',path:'/social-accounts'},
   {Icon:BarChart3,label:'Registrar métricas',path:'/metrics/register'},
   {Icon:FileBarChart,label:'Generar reporte',path:'/reports'},
 ].map(({Icon,label,path})=><Link key={path} to={path} className="group min-h-[96px] rounded-2xl border border-pink/15 bg-pink-soft/35 p-5 flex items-center gap-4 hover:bg-pink-soft transition-colors"><span className="w-11 h-11 rounded-xl bg-white text-pink grid place-items-center"><Icon className="w-5 h-5"/></span><strong className="text-sm flex-1">{label}</strong><ArrowRight className="w-4 h-4 text-pink group-hover:translate-x-1 transition-transform"/></Link>)}</div></section></div>}
