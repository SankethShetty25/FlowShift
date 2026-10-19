import React from 'react';
import {
  Compass,
  RotateCcw,
  Zap,
  Clock,
  MapPin,
  Ban,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function ControlPanel({
  nodes = [],
  source,
  setSource,
  destination,
  setDestination,
  optimization,
  setOptimization,
  onCalculate,
  onReset,
  loading,
  blockedRoads = [],
  onUnblockRoad,
  onUnblockAll,
}) {
  const isReadyToCalculate = source && destination && source !== destination;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Title */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Compass className="h-4 w-4 text-emerald-600" />
          Route Configuration
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Select endpoints or click nodes in the graph
        </p>
      </div>

      {/* Source Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          Source Origin
        </label>
        <div className="relative">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
          >
            <option value="">Select origin intersection...</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.id} — {node.name}
              </option>
            ))}
          </select>
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-emerald-600 pointer-events-none" />
        </div>
      </div>

      {/* Destination Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-red-500" />
          Target Destination
        </label>
        <div className="relative">
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 shadow-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition"
          >
            <option value="">Select destination intersection...</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.id} — {node.name}
              </option>
            ))}
          </select>
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-500 pointer-events-none" />
        </div>
      </div>

      {/* Optimization Mode Toggle */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Optimization Priority
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setOptimization('distance')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              optimization === 'distance'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
            Shortest Distance
          </button>
          <button
            type="button"
            onClick={() => setOptimization('time')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              optimization === 'time'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            Fastest Time
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={onCalculate}
          disabled={!isReadyToCalculate || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Computing Optimal Path...
            </div>
          ) : (
            <>
              <Compass className="h-4 w-4" />
              Calculate Route
            </>
          )}
        </button>

        <button
          onClick={onReset}
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Selections
        </button>
      </div>

      {/* Blocked Roads Section */}
      <div className="border-t border-slate-100 pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Ban className="h-4 w-4 text-red-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Blocked Roads ({blockedRoads.length})
            </h4>
          </div>
          {blockedRoads.length > 0 && (
            <button
              onClick={onUnblockAll}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 underline"
            >
              Unblock All
            </button>
          )}
        </div>

        {blockedRoads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-center">
            <p className="text-xs text-slate-500">
              No roads blocked. Click any road on the map to simulate a road closure.
            </p>
          </div>
        ) : (
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {blockedRoads.map((roadId) => {
              const label = typeof roadId === 'string' ? roadId : JSON.stringify(roadId);
              return (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-1.5 text-xs text-red-900"
                >
                  <span className="font-mono font-semibold">Road {label}</span>
                  <button
                    onClick={() => onUnblockRoad(roadId)}
                    title="Remove blockage"
                    className="flex h-5 w-5 items-center justify-center rounded text-red-500 hover:bg-red-200/60 hover:text-red-800 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Helper Hint */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-500 flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Tip:</strong> Click any node on the graph to set source / destination, or click
          any road to toggle blockades on the fly.
        </p>
      </div>
    </div>
  );
}
