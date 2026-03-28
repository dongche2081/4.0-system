import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItemComponent
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const ToastItemComponent: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <Check className="w-4 h-4" />,
    error: <X className="w-4 h-4" />,
    info: <AlertCircle className="w-4 h-4" />,
  };

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-amber-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[200px]"
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${bgColors[toast.type]}`}>
        {icons[toast.type]}
      </div>
      <span className="text-sm font-medium">{toast.message}</span>
    </motion.div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};
