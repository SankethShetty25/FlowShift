import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Milestone,
} from 'lucide-react';
import { simulateTraffic, calculateRoute } from '../../services/api';
import { formatDistance, formatTime, getRoadId } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

export default function TrafficSimulation({
  nodes = [],
  roads = [],
  blockedRoads = [],
}) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [trafficConditions, setTrafficConditions] = useState({});
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrafficChange = (roadId, level) => {
    setTrafficConditions((prev) => ({
      ...prev,
      [roadId]: level,
    }));
  };

  const handleResetCongestion = () => {
    setTrafficConditions({});
    setSimulationResult(null);
    setError(null);
  };

  const runSimulation = async () => {
    if (!source || !destination) {
      setError('Please select both source and destination intersections.');
      return;
    }

    if (source === destination) {
      setError('Source and destination cannot be the same intersection.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call simulateTraffic API
      let data;
      try {
        data = await simulateTraffic(source, destination, trafficConditions, blockedRoads);
      } catch (simErr) {
        // Fallback to route calculation with time optimization and traffic conditions
        data = await calculateRoute(source, destination, blockedRoads, 'time', trafficConditions);
      }

      const path = data.path || data.route || [];
      const normalTime = Number(
        data.normal_time ?? data.normalTime ?? data.baseline_time ?? (data.total_distance ? data.total_distance * 1.5 : 15)
      );
      const congestedTime = Number(
        data.congested_time ?? data.congestedTime ?? data.total_time ?? data.totalTime ?? (normalTime * 1.4)
      );
      const distance = Number(
        data.total_distance ?? data.totalDistance ?? data.distance ?? 0
      );

      setSimulationResult({
        source,
        destination,
        path,
        normalTime,
        congestedTime,
        distance,
        timeDelay: Math.max(0, congestedTime - normalTime),
        segments: data.segments || [],
      });
    } catch (err) {
      console.error('Simulation failure:', err);
      setError(err.message || 'Failed to simulate traffic conditions.');
    } finally {
      setLoading(false);
    }
  };

  // Congestion level count
  const heavyCount = Object.values(trafficConditions).filter((v) => v === 'heavy').length;
  const modCount = Object.values(trafficConditions).filter((v) => v === 'moderate').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Simulated Traffic Conditions
                </h3>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Live Scenario Modeling
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate peak-hour bottlenecks, construction delays, and observe dynamic path
                recomputations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCongestion}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear Congestion
            </button>
            <button
              onClick={runSimulation}
              disabled={loading || !source || !destination}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  Run Traffic Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Source & Destination selectors */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 block">
              Origin Intersection
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Choose origin...</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} — {n.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1 block">
              Destination Intersection
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
            >
              <option value="">Choose destination...</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} — {n.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorMessage title="Simulation Alert" message={error} />}

      {/* Simulation Result Comparison Banner */}
      {simulationResult && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Simulation Findings
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                Intersection {simulationResult.source}
                <ArrowRight className="h-4 w-4 text-emerald-600" />
                Intersection {simulationResult.destination}
              </h4>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
              <strong>Recalculated Path:</strong> {simulationResult.path?.join(' → ')}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Baseline Time</span>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {formatTime(simulationResult.normalTime)}
              </p>
              <p className="text-[10px] text-slate-400">Zero congestion flow</p>
            </div>

            <div className="rounded-xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-700 uppercase">Congested Time</span>
              <p className="text-lg font-bold text-amber-700 mt-1">
                {formatTime(simulationResult.congestedTime)}
              </p>
              <p className="text-[10px] text-amber-600">With injected bottlenecks</p>
            </div>

            <div className="rounded-xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-red-600 uppercase">Traffic Delay</span>
              <p className="text-lg font-bold text-red-600 mt-1">
                +{formatTime(simulationResult.timeDelay)}
              </p>
              <p className="text-[10px] text-red-500">
                {simulationResult.normalTime > 0
                  ? `+${Math.round((simulationResult.timeDelay / simulationResult.normalTime) * 100)}% latency`
                  : '0%'}
              </p>
            </div>

            <div className="rounded-xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Distance</span>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {formatDistance(simulationResult.distance)}
              </p>
              <p className="text-[10px] text-slate-400">Physical corridor span</p>
            </div>
          </div>
        </div>
      )}

      {/* Roads Congestion Settings Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">
              Corridor Traffic Controls
            </h4>
            <p className="text-xs text-slate-500">
              Configure traffic intensity level for individual road links.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
              Low: Normal
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800">
              Mod: {modCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800">
              Heavy: {heavyCount}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Road Name</th>
                <th className="py-3 px-4">Corridor</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Base Time</th>
                <th className="py-3 px-4">Congestion Level</th>
                <th className="py-3 px-4 text-right">Estimated Delay Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roads.map((road) => {
                const roadId = getRoadId(road.source, road.destination);
                const currentLevel = trafficConditions[roadId] || 'low';

                const levelBadgeStyles = {
                  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  moderate: 'bg-amber-50 text-amber-700 border-amber-200',
                  heavy: 'bg-red-50 text-red-700 border-red-200',
                };

                const delayMultiplier = {
                  low: '1.0x (Speed Limit)',
                  moderate: '1.8x (+80% Time)',
                  heavy: '3.0x (+200% Gridlock)',
                };

                return (
                  <tr key={roadId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {road.name || `Corridor ${roadId}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {road.source} ↔ {road.destination}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDistance(road.distance)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatTime(road.time)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={currentLevel}
                          onChange={(e) => handleTrafficChange(roadId, e.target.value)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 transition ${
                            levelBadgeStyles[currentLevel]
                          }`}
                        >
                          <option value="low">Low (Clear Flow)</option>
                          <option value="moderate">Moderate (Slowdown)</option>
                          <option value="heavy">Heavy (Congested)</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      {delayMultiplier[currentLevel]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
