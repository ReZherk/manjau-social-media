import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Share2, LayoutGrid } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkTag } from '@/shared/components/NetworkTag';
import { cn } from '@/shared/lib/utils';
import { platformStyle, publicationStatusStyle } from '@/shared/lib/catalog';
import { useScheduledPublications, useHistoryPublications } from '@/modules/publications/hooks/usePublications';
import { useSocialAccounts } from '@/modules/social-accounts/hooks/useSocialAccounts';

const EMPTY_FILTERS = { search: '', from: '', to: '', page: 0, size: 5 };

function StatCard({ icon: Icon, tone, value, label }: { icon: React.ElementType; tone: string; value: number | string; label: string }) {
  return (
    <article className="card p-5 flex flex-col">
      <div className={cn('w-9 h-9 rounded-xl grid place-items-center mb-3', tone)}>
        <Icon className="w-4 h-4" />
      </div>
      <strong className="font-serif text-2xl">{value}</strong>
      <span className="mt-1 text-[11px] text-text-muted">{label}</span>
    </article>
  );
}

export default function CommunityDashboardPage() {
  const scheduled = useScheduledPublications(EMPTY_FILTERS);
  const history = useHistoryPublications({ ...EMPTY_FILTERS, size: 1 });
  const accounts = useSocialAccounts({ search: '', platform: '', status: 'ACTIVE', page: 0, size: 20 });

  const upcoming = scheduled.data?.data.content ?? [];
  const activeAccounts = accounts.data?.data.content ?? [];
  const scheduledCount = scheduled.data?.data.totalElements ?? 0;
  const publishedCount = history.data?.data.totalElements ?? 0;

  const period = new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const isLoading = scheduled.isLoading || accounts.isLoading || history.isLoading;

  return (
    <div>
      <PageHeader title="Mi Panel" subtitle={`Resumen de publicaciones · ${period}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={CalendarClock} tone="text-lavender bg-lavender-soft" value={scheduledCount} label="Publicaciones programadas" />
        <StatCard icon={CheckCircle2} tone="text-mint bg-mint-soft" value={publishedCount} label="Publicadas" />
        <StatCard icon={Share2} tone="text-pink bg-pink-soft" value={activeAccounts.length} label="Redes activas" />
        <StatCard icon={LayoutGrid} tone="text-peach bg-peach-soft" value={scheduledCount + publishedCount} label="Total gestionadas" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2.1fr_1fr] gap-5">
        {/* Upcoming */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Próximas publicaciones</h2>
            <Link to="/publications/scheduled" className="text-[11px] text-lavender hover:underline">Ver todas</Link>
          </div>

          {isLoading ? (
            <LoadingSkeleton count={4} className="h-16 w-full rounded-2xl mb-2" />
          ) : upcoming.length === 0 ? (
            <EmptyState title="Sin publicaciones próximas" description="Programa una nueva publicación." />
          ) : (
            <div className="grid gap-2.5">
              {upcoming.map((pub) => {
                const status = publicationStatusStyle(pub.status);
                return (
                  <article key={pub.id} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 p-3 rounded-2xl bg-[#fdf9f7] border border-border">
                    <div className="w-9 h-9 rounded-xl bg-lavender-soft text-lavender grid place-items-center"><CalendarClock className="w-4 h-4" /></div>
                    <div className="min-w-0">
                      <strong className="block text-xs font-semibold truncate">{pub.title}</strong>
                      <span className="block text-[9px] text-text-muted mt-0.5">
                        {new Date(pub.scheduledAt).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {pub.targetAccounts.map((a) => <NetworkTag key={a.id} code={a.platformCode} />)}
                      </div>
                    </div>
                    <span className={cn('badge text-[10px]', status.className)}>{status.label}</span>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Active networks */}
        <section className="card p-5">
          <h2 className="text-sm font-medium mb-4">Redes activas</h2>
          {isLoading ? (
            <LoadingSkeleton count={3} className="h-14 w-full rounded-2xl mb-2" />
          ) : activeAccounts.length === 0 ? (
            <p className="text-xs text-text-muted">No hay cuentas activas.</p>
          ) : (
            <div className="grid gap-2.5">
              {activeAccounts.map((account) => {
                const style = platformStyle(account.platformCode);
                return (
                  <div key={account.id} className={cn('grid grid-cols-[32px_1fr] items-center gap-2.5 p-2.5 rounded-2xl', style.softClass)}>
                    <span className="w-7 h-7 rounded-full bg-white/80 grid place-items-center text-[10px] font-bold">{style.short}</span>
                    <div className="min-w-0">
                      <strong className="block text-[11px] font-semibold truncate">{style.label}</strong>
                      <span className="block text-[9px] text-text-muted truncate">{account.accountName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link to="/social-accounts" className="mt-4 block text-center text-[11px] text-lavender hover:underline">Gestionar redes</Link>
        </section>
      </div>
    </div>
  );
}
