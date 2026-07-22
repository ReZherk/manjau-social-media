import { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/shared/layouts/AppSidebar';
import { AppTopbar } from '@/shared/layouts/AppTopbar';
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-sidebar min-w-0 flex flex-col min-h-screen">
        <AppTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-5 sm:px-8 lg:px-10 py-8 pb-16">
          <div className="w-full max-w-[1200px] mx-auto">
            <Suspense
              fallback={
                <div className="min-h-[420px] space-y-5" aria-label="Cargando pantalla">
                  <LoadingSkeleton className="h-16 w-full rounded-2xl" />
                  <LoadingSkeleton className="h-28 w-full rounded-2xl" />
                  <LoadingSkeleton count={3} className="h-20 w-full rounded-2xl" />
                </div>
              }
            >
              <div key={location.pathname} className="animate-pageEnter">
                <Outlet />
              </div>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
