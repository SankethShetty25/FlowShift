import React from 'react';
import TrafficSimulation from '../components/traffic-simulation/TrafficSimulation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function TrafficSimulationPage({ networkState }) {
  const { nodes, roads, blockedRoads, loading, error, refetchNetwork } = networkState;

  if (loading && nodes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner message="Preparing traffic simulation engine..." size="lg" />
      </div>
    );
  }

  if (error && nodes.length === 0) {
    return (
      <ErrorMessage
        title="Simulation Engine Unavailable"
        message={error}
        onRetry={refetchNetwork}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Traffic Congestion Simulation</h2>
        <p className="text-xs text-slate-500 mt-1">
          Simulate traffic load across road links, test adaptive routing algorithms, and evaluate transit delay impacts.
        </p>
      </div>

      <TrafficSimulation
        nodes={nodes}
        roads={roads}
        blockedRoads={blockedRoads}
      />
    </div>
  );
}
