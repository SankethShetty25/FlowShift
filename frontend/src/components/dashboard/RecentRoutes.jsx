import React from 'react';
import { Route, Clock, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';
import { formatDistance, formatTime } from '../../utils/helpers';

export default function RecentRoutes({ history = [], onNavigateToPlanner }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mx-auto mb-3">
          <Route className="h-6 w-6" />
        </div>
        <h4 className="font-semibold text-slate-800 text-sm">No Recent Routes</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Route queries will be logged here in real-time as you optimize urban travel paths.
        </p>
        {onNavigateToPlanner && (
          <button
            onClick={onNavigateToPlanner}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Plan First Route
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Recent Route Inquiries</h3>
          <p className="text-xs text-slate-500">History of calculated paths in this session</p>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {history.length} calculated
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {history.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2 hover:bg-slate-50/60 px-2 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                  item.isRerouted
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {item.source}
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
                  <span>Intersection {item.source}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  <span>Intersection {item.destination}</span>
                  {item.isRerouted && (
                    <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                      Rerouted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <CornerDownRight className="h-3 w-3 text-slate-400" />
                    Path: {item.path?.join(' → ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatDistance(item.distance)}</p>
                <p className="text-slate-500 flex items-center justify-end gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(item.time)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
