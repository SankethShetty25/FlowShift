import React from 'react';

export default function Legend({ className = '' }) {
  const items = [
    {
      label: 'Normal Road',
      element: <div className="h-0.5 w-6 bg-slate-400 rounded" />,
    },
    {
      label: 'Selected Route',
      element: <div className="h-1 w-6 bg-emerald-500 rounded shadow-sm shadow-emerald-500/50" />,
    },
    {
      label: 'Alternative Route',
      element: (
        <div
          className="h-0.5 w-6 border-t-2 border-dashed border-blue-500"
          style={{ borderTopWidth: '2.5px' }}
        />
      ),
    },
    {
      label: 'Blocked Road',
      element: (
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-4 border-t-2 border-dashed border-red-500" />
          <span className="text-[10px] font-bold text-red-500">✕</span>
        </div>
      ),
    },
    {
      label: 'Source Node',
      element: (
        <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
      ),
    },
    {
      label: 'Destination Node',
      element: (
        <div className="h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-red-200" />
      ),
    },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-2 text-xs text-slate-600 backdrop-blur shadow-sm ${className}`}
    >
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.element}
          <span className="font-medium text-slate-600 text-[11px]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
