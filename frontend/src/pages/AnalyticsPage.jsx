import React from 'react';
import Analytics from '../components/analytics/Analytics';

export default function AnalyticsPage({
  history = [],
  blockedRoads = [],
  totalRoads = 0,
  setActivePage,
}) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Route Analytics & Telemetry</h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical overview of routing decisions, distance telemetry, and network availability impact.
        </p>
      </div>

      <Analytics
        history={history}
        blockedRoads={blockedRoads}
        totalRoads={totalRoads}
        onNavigateToPlanner={() => setActivePage('route-planner')}
      />
    </div>
  );
}
