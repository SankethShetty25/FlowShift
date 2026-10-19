import React from 'react';
import NetworkExplorer from '../components/network-explorer/NetworkExplorer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function NetworkExplorerPage({ networkState }) {
  const { nodes, roads, blockedRoads, toggleBlockRoad, loading, error, refetchNetwork } =
    networkState;

  if (loading && nodes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner message="Fetching network components and connectivity data..." size="lg" />
      </div>
    );
  }

  if (error && nodes.length === 0) {
    return (
      <ErrorMessage
        title="Network Exploration Unavailable"
        message={error}
        onRetry={refetchNetwork}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Network Topology Explorer</h2>
        <p className="text-xs text-slate-500 mt-1">
          Inspect urban intersections, road segments, physical metrics, and current statuses.
        </p>
      </div>

      <NetworkExplorer
        nodes={nodes}
        roads={roads}
        blockedRoads={blockedRoads}
        onToggleBlockRoad={toggleBlockRoad}
      />
    </div>
  );
}
