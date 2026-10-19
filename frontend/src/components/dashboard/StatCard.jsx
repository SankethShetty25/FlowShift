import React from 'react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  colorScheme = 'emerald', // emerald, blue, amber, red, purple
}) {
  const schemeStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.emerald;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${currentScheme.bg} ${currentScheme.text} ${currentScheme.border} border`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </span>
        </div>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
