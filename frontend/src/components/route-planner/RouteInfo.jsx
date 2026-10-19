import React, { useState } from 'react';
import {
  Route,
  Clock,
  Milestone,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  GitCommit,
  CheckCircle2,
} from 'lucide-react';
import { formatDistance, formatTime } from '../../utils/helpers';

export default function RouteInfo({
  currentRoute,
  alternatives = [],
  blockedRoads = [],
}) {
  const [showAlternatives, setShowAlternatives] = useState(true);

  if (!currentRoute) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Route className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">No Active Route</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
          Select an origin and target intersection from the control panel or directly on the map,
          then click <strong>Calculate Route</strong>.
        </p>
      </div>
    );
  }

  const path = currentRoute.path || [];
  const segments = currentRoute.segments || [];
  const stops = Math.max(0, path.length - 1);
  const isRerouted = currentRoute.isRerouted;
  const distanceDiff = currentRoute.totalDistance - currentRoute.originalDistance;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-h-[780px] overflow-y-auto">
      {/* Route Header */}
      <div className="border-b border-slate-100 pb-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Optimal Path Found
          </span>
          {isRerouted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              Dynamic Reroute
            </span>
          )}
        </div>

        <h3 className="mt-2 text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Intersection {currentRoute.source}</span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <span>Intersection {currentRoute.destination}</span>
        </h3>
        <p className="text-xs text-slate-500 capitalize">
          Optimized for {currentRoute.optimization === 'time' ? 'travel time' : 'physical distance'}
        </p>
      </div>

      {/* Path Waypoint visualization: A -> B -> E -> ... */}
      <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Turn-by-Turn Waypoints ({path.length} vertices)
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {path.map((node, idx) => (
            <React.Fragment key={idx}>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shadow-xs ${
                  idx === 0
                    ? 'bg-emerald-600 text-white'
                    : idx === path.length - 1
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                {node}
              </span>
              {idx < path.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center">
          <Milestone className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Distance
          </p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {formatDistance(currentRoute.totalDistance)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center">
          <Clock className="h-4 w-4 mx-auto text-blue-600 mb-1" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Travel Time
          </p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {formatTime(currentRoute.totalTime)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center">
          <GitCommit className="h-4 w-4 mx-auto text-purple-600 mb-1" />
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Intersections
          </p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {stops}
          </p>
        </div>
      </div>

      {/* Reroute Alert & Comparison */}
      {isRerouted && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Route Altered Due to Active Blockades</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            The standard corridor is closed. FlowShift navigated around blocked roads to find this
            resilient detour.
          </p>
          <div className="flex items-center justify-between border-t border-amber-200/60 pt-2 text-[11px]">
            <span>Baseline Distance:</span>
            <span className="font-semibold">{formatDistance(currentRoute.originalDistance)}</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>Detour Impact:</span>
            <span
              className={`font-semibold ${
                distanceDiff > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {distanceDiff >= 0 ? `+${formatDistance(distanceDiff)}` : formatDistance(distanceDiff)}
            </span>
          </div>
          {currentRoute.blockedRoadsAffected?.length > 0 && (
            <div className="text-[10px] text-amber-700 pt-1">
              Bypassed:{' '}
              {currentRoute.blockedRoadsAffected
                .map((b) => (typeof b === 'string' ? b : JSON.stringify(b)))
                .join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Segments Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          Corridor Breakdown
        </h4>
        <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2 px-3">Segment</th>
                <th className="py-2 px-3">Distance</th>
                <th className="py-2 px-3 text-right">Est. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {segments.length > 0 ? (
                segments.map((seg, idx) => {
                  const from = seg.source || seg.from || seg.node1 || path[idx];
                  const to = seg.destination || seg.to || seg.node2 || path[idx + 1];
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {from} → {to}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {formatDistance(seg.distance || seg.length)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">
                        {formatTime(seg.time || (seg.distance ? seg.distance * 1.5 : 2))}
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Fallback if segments array isn't populated separately */
                path.slice(0, -1).map((node, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {node} → {path[idx + 1]}
                    </td>
                    <td className="py-2 px-3 text-slate-600">—</td>
                    <td className="py-2 px-3 text-right text-slate-600">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alternative Routes Section (Collapsible) */}
      {alternatives.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              Alternative Paths ({alternatives.length})
            </span>
            {showAlternatives ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showAlternatives && (
            <div className="mt-2 space-y-2">
              {alternatives.map((alt, idx) => {
                const diffKm = alt.totalDistance - currentRoute.totalDistance;
                return (
                  <div
                    key={alt.id || idx}
                    className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>Option #{idx + 1}</span>
                      <span className="text-blue-700 font-bold">
                        {formatDistance(alt.totalDistance)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Time: {formatTime(alt.totalTime)}</span>
                      <span className="text-slate-400">
                        {diffKm > 0 ? `+${formatDistance(diffKm)} longer` : 'similar distance'}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] text-slate-600 truncate">
                      {alt.path?.join(' → ')}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
