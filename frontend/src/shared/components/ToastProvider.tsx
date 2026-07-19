import * as Toast from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...message, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast.Provider swipeDirection="right">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={cn(
              'fixed bottom-4 right-4 z-[100] w-[360px] p-4 rounded-xl shadow-dialog border',
              'bg-surface',
              toast.variant === 'success' && 'border-success-soft',
              toast.variant === 'error' && 'border-red-200',
              'data-[state=open]:animate-slideIn',
            )}
            onOpenChange={() => removeToast(toast.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <Toast.Title className="font-medium text-sm text-text">
                  {toast.title}
                </Toast.Title>
                {toast.description && (
                  <Toast.Description className="text-xs text-text-muted mt-1">
                    {toast.description}
                  </Toast.Description>
                )}
              </div>
              <Toast.Close className="p-1 hover:bg-soft-pink rounded-lg">
                <X className="w-4 h-4 text-text-muted" />
              </Toast.Close>
            </div>
          </Toast.Root>
        ))}
        <Toast.Viewport />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
