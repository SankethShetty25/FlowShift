import React from 'react';
import { Wifi, WifiOff, RefreshCw, Activity, ShieldCheck } from 'lucide-react';

const MODULE_TITLES = {
  overview: 'System Overview & Telemetry',
  'route-planner': 'Dynamic Route Planner',
  'network-explorer': 'Network Topology Explorer',
  'traffic-simulation': 'Traffic Congestion Simulation',
  analytics: 'Operational Route Analytics',
  settings: 'System Configuration',
};

const MODULE_DESCRIPTIONS = {
  overview: 'Real-time urban transit metrics and network graph status',
  'route-planner': 'Interactive graph visualization, real-time routing, and dynamic road blockade handling',
  'network-explorer': 'Inspect street segments, intersections, and physical distances',
  'traffic-simulation': 'Model road congestion scenarios and observe recalculations',
  analytics: 'Session route performance, distance metrics, and reroute insights',
  settings: 'API connectivity diagnostics and engine parameters',
};

export default function TopNav({
  activePage,
  isConnected,
  isLoading,
  onRefresh,
  blockedRoadCount = 0,
}) {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      {/* Current Page Title */}
      <div>
        <h1 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          {MODULE_TITLES[activePage] || 'FlowShift'}
          {blockedRoadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {blockedRoadCount} road{blockedRoadCount > 1 ? 's' : ''} blocked
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500 hidden sm:block">
          {MODULE_DESCRIPTIONS[activePage] || 'Dynamic Urban Route Intelligence'}
        </p>
      </div>

      {/* Status Badges & Quick Action */}
      <div className="flex items-center gap-4">
        {/* System Operational Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-700">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>System Operational</span>
        </div>

        {/* Backend API Connection Status */}
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            isConnected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
          title={isConnected ? 'Backend API connected at localhost:8000' : 'Disconnected from backend'}
        >
          {isConnected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Backend Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-amber-600" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
            title="Refresh network data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
}
