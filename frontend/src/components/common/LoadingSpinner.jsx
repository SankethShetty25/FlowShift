import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 40,
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 ${className}`}>
      <Loader2
        size={iconSizes[size] || 24}
        className="animate-spin text-emerald-600 mb-2"
      />
      {message && <p className="font-medium text-slate-600 text-sm tracking-wide">{message}</p>}
    </div>
  );
}
