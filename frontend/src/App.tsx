import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './app/providers/AuthProvider';
import { ToastProvider } from './shared/components/ToastProvider';
import { AppRouter } from './app/router/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
