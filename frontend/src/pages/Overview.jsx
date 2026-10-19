import React from 'react';
import { Network, GitFork, CheckCircle, Ban, ArrowRight, Compass, ShieldAlert } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import NetworkStatus from '../components/dashboard/NetworkStatus';
import RecentRoutes from '../components/dashboard/RecentRoutes';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Overview({
  networkState,
  routeHistory = [],
  setActivePage,
}) {
  const { nodes, roads, stats, blockedRoads, loading, error, isConnected, refetchNetwork } =
    networkState;

  if (loading && nodes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner message="Synchronizing urban network telemetry..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              FlowShift Intelligent Routing
            </span>
            <span className="text-xs text-slate-300">• Live Simulation Engine</span>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Dynamic Urban Route Intelligence
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-300">
            Real-time urban navigation, multi-criteria path optimization, dynamic congestion
            rerouting, and network resilience modeling.
          </p>
        </div>

        <button
          onClick={() => setActivePage('route-planner')}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition active:scale-95"
        >
          <Compass className="h-4 w-4" />
          Plan New Route
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Error state alert if API failed */}
      {error && (
        <ErrorMessage
          title="Backend Connection Issue"
          message={error}
          onRetry={refetchNetwork}
        />
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Network}
          label="Total Intersections"
          value={stats.totalIntersections}
          subtitle="Graph vertices"
          colorScheme="blue"
        />
        <StatCard
          icon={GitFork}
          label="Total Roads"
          value={stats.totalRoads}
          subtitle="Bidirectional corridors"
          colorScheme="purple"
        />
        <StatCard
          icon={CheckCircle}
          label="Available Roads"
          value={stats.availableRoads}
          subtitle="Open for transit"
          colorScheme="emerald"
        />
        <StatCard
          icon={Ban}
          label="Blocked Roads"
          value={stats.blockedCount}
          subtitle={stats.blockedCount > 0 ? 'Active closures' : 'Zero interruptions'}
          colorScheme={stats.blockedCount > 0 ? 'red' : 'emerald'}
        />
      </div>

      {/* Network Status + Quick Plan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetworkStatus
            isConnected={isConnected}
            stats={stats}
            blockedRoads={blockedRoads}
            onNavigateToPlanner={() => setActivePage('route-planner')}
          />
        </div>

        {/* Quick Action Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-3">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Interactive Dispatch</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Explore dynamic rerouting when roads close unexpectedly. Graph visualization lets
              you toggle blockades directly with a single click.
            </p>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Dijkstra Shortest Path</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fastest Time Heuristic</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Alternative Path Exploration</span>
                <span className="font-semibold text-emerald-600">k = 2</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('route-planner')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            Open Route Planner
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Route Inquiries */}
      <RecentRoutes
        history={routeHistory}
        onNavigateToPlanner={() => setActivePage('route-planner')}
      />
    </div>
  );
}
