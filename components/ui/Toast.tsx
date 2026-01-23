import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Undo2 } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
  onUndo?: () => void;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-lg border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
              toast.type === 'success' ? 'bg-white border-green-200 text-green-800' :
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-white border-nexus-200 text-nexus-800'
            }`}
          >
            <div className="mt-0.5 shrink-0">
               {toast.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
               {toast.type === 'error' && <AlertTriangle size={18} className="text-red-500" />}
               {toast.type === 'info' && <Info size={18} className="text-nexus-500" />}
            </div>
            
            <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
                {toast.onUndo && (
                    <button 
                        onClick={() => {
                            toast.onUndo?.();
                            removeToast(toast.id);
                        }}
                        className="mt-2 text-xs font-bold flex items-center gap-1.5 text-nexus-600 hover:text-nexus-900 transition-colors bg-nexus-100/50 hover:bg-nexus-100 px-2 py-1 rounded-md"
                    >
                        <Undo2 size={12} /> 元に戻す
                    </button>
                )}
            </div>

            <button 
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            >
                <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
