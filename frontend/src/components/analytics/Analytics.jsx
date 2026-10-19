import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Milestone,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import { formatDistance, formatTime } from '../../utils/helpers';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics({
  history = [],
  blockedRoads = [],
  totalRoads = 0,
  onNavigateToPlanner,
}) {
  // Key metrics derived from state
  const totalCalculations = history.length;

  const totalDistanceSum = useMemo(() => {
    return history.reduce((sum, item) => sum + (Number(item.distance) || 0), 0);
  }, [history]);

  const avgDistance = totalCalculations > 0 ? (totalDistanceSum / totalCalculations).toFixed(1) : 0;

  const rerouteCount = useMemo(() => {
    return history.filter((item) => item.isRerouted).length;
  }, [history]);

  const networkAvailability =
    totalRoads > 0
      ? Math.round(((totalRoads - blockedRoads.length) / totalRoads) * 100)
      : 100;

  // Prepare Bar Chart data: route query distances
  const barChartData = useMemo(() => {
    return history
      .slice(0, 10)
      .reverse()
      .map((item, idx) => ({
        name: `#${idx + 1} (${item.source}→${item.destination})`,
        distance: Number((Number(item.distance) || 0).toFixed(1)),
        time: Number((Number(item.time) || 0).toFixed(1)),
      }));
  }, [history]);

  // Road usage frequency from paths
  const roadUsageData = useMemo(() => {
    const counts = {};
    history.forEach((h) => {
      const p = h.path || [];
      for (let i = 0; i < p.length - 1; i++) {
        const u = p[i];
        const v = p[i + 1];
        const roadKey = `${u}–${v}`;
        counts[roadKey] = (counts[roadKey] || 0) + 1;
      }
    });

    const entries = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return entries;
  }, [history]);

  // Road availability distribution for Pie Chart
  const roadStatusData = useMemo(() => {
    const blocked = blockedRoads.length;
    const available = Math.max(0, totalRoads - blocked);
    return [
      { name: 'Available Corridors', value: available || 1 },
      { name: 'Blocked Corridors', value: blocked },
    ];
  }, [totalRoads, blockedRoads]);

  const PIE_COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Compass}
          label="Routes Computed"
          value={totalCalculations}
          subtitle="In-session optimization queries"
          colorScheme="blue"
        />
        <StatCard
          icon={Milestone}
          label="Avg Route Distance"
          value={`${avgDistance} km`}
          subtitle="Mean optimal trajectory"
          colorScheme="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Reroutes Triggered"
          value={rerouteCount}
          subtitle="Blockade detours taken"
          colorScheme="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Network Availability"
          value={`${networkAvailability}%`}
          subtitle={`${blockedRoads.length} roads blocked currently`}
          colorScheme="purple"
        />
      </div>

      {totalCalculations === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Analytics Data Yet</h3>
          <p className="mt-1 max-w-sm mx-auto text-xs text-slate-500 leading-relaxed">
            Execute route calculations in the Route Planner or simulate congestion scenarios to
            generate telemetry charts and performance metrics.
          </p>
          {onNavigateToPlanner && (
            <button
              onClick={onNavigateToPlanner}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Start Planning Routes
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* Charts & Visualizations */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Recent Route Distances */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Route Distance Telemetry (km)
                </h4>
                <p className="text-xs text-slate-500">
                  Physical travel spans across recent optimization requests
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`${val} km`, 'Distance']}
                  />
                  <Bar
                    dataKey="distance"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Network Road Availability */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Network Road Availability Ratio
              </h4>
              <p className="text-xs text-slate-500">
                Proportion of active corridors vs current closures
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roadStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roadStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around border-t border-slate-100 pt-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Available ({roadStatusData[0].value})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Blocked ({roadStatusData[1].value})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                Session Audit Log
              </h4>
              <p className="text-xs text-slate-500">
                Complete sequential history of generated routing requests
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Request Time</th>
                  <th className="py-3 px-4">Origin → Destination</th>
                  <th className="py-3 px-4">Optimal Path</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Est. Time</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.source} → {item.destination}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 max-w-xs truncate">
                      {item.path?.join(' → ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {formatDistance(item.distance)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatTime(item.time)}
                    </td>
                    <td className="py-3 px-4">
                      {item.isRerouted ? (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          Rerouted (+{formatDistance(item.distanceDiff)})
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          Direct Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
