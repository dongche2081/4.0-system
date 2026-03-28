import React, { useState, useEffect, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// 使用函数组件 + Error Boundary 模式
export const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const [state, setState] = useState<State>({ hasError: false });

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Error caught by boundary:', error);
      setState({ hasError: true, error: error.error });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleRetry = () => {
    setState({ hasError: false, error: undefined });
  };

  if (state.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            页面加载出错
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            抱歉，页面加载时遇到了问题。请尝试刷新页面。
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
