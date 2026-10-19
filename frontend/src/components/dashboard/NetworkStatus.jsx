import React from 'react';
import { Activity, CheckCircle2, AlertOctagon, Shield, Server, ArrowRight } from 'lucide-react';

export default function NetworkStatus({
  isConnected,
  stats,
  blockedRoads = [],
  onNavigateToPlanner,
}) {
  const totalRoads = stats?.totalRoads || 0;
  const blockedCount = blockedRoads.length;
  const operationalRatio = totalRoads > 0 ? (((totalRoads - blockedCount) / totalRoads) * 100).toFixed(0) : 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Network Operational Health</h3>
            <p className="text-xs text-slate-500">Real-time status of urban road network</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {isConnected ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Optimal Performance
            </>
          ) : (
            <>
              <AlertOctagon className="h-3.5 w-3.5 text-amber-600" />
              Backend Inactive
            </>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <Server className="h-4 w-4 text-slate-400" />
            Backend Connection
          </div>
          <p className="mt-2 text-lg font-bold text-slate-800">
            {isConnected ? 'Connected (Port 8000)' : 'Disconnected'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isConnected ? 'Django REST Framework API' : 'Please start backend server'}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <Shield className="h-4 w-4 text-emerald-500" />
            Road Network Availability
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-800">{operationalRatio}%</span>
            <span className="text-xs text-slate-500">active corridors</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                Number(operationalRatio) > 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${operationalRatio}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <AlertOctagon className="h-4 w-4 text-red-500" />
            Active Road Closures
          </div>
          <p className="mt-2 text-lg font-bold text-slate-800">
            {blockedCount} {blockedCount === 1 ? 'Closure' : 'Closures'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {blockedCount > 0 ? 'Routing algorithms automatically divert' : 'All network corridors clear'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg bg-emerald-50/60 border border-emerald-100 p-4">
        <div>
          <h4 className="text-sm font-semibold text-emerald-950">Ready to plan dynamic routes?</h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            Test custom source/destination pairs and simulate real-time road closures.
          </p>
        </div>
        {onNavigateToPlanner && (
          <button
            onClick={onNavigateToPlanner}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Launch Planner
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
