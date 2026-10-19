import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50/70 p-4 text-red-800 shadow-sm transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-100 p-2 text-red-600 flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 text-sm">{title}</h4>
          {message && (
            <p className="mt-1 text-sm text-red-700 leading-relaxed font-normal">
              {message}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
