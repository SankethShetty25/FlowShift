import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ComingSoon({
  title = 'Under Construction',
  description = 'This feature is planned for the next release of FlowShift.',
  icon: Icon = Sparkles,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  );
}
