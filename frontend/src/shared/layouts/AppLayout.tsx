import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/shared/layouts/AppSidebar';
import { AppTopbar } from '@/shared/layouts/AppTopbar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-sidebar min-w-0 flex flex-col min-h-screen">
        <AppTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-6 sm:px-8 lg:px-10 py-6 pb-16">
          <div className="w-full max-w-[1080px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
