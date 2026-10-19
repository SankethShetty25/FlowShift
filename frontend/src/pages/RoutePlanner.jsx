import React, { useState } from 'react';
import ControlPanel from '../components/route-planner/ControlPanel';
import NetworkGraph from '../components/route-planner/NetworkGraph';
import RouteInfo from '../components/route-planner/RouteInfo';
import Legend from '../components/route-planner/Legend';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RoutePlanner({
  networkState,
  routeCalculationState,
}) {
  const {
    nodes,
    roads,
    blockedRoads,
    toggleBlockRoad,
    unblockAll,
    loading: networkLoading,
    error: networkError,
    refetchNetwork,
  } = networkState;

  const {
    currentRoute,
    alternatives,
    loading: calculating,
    error: calcError,
    calculateRoute,
    clearRoute,
    setError,
  } = routeCalculationState;

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [optimization, setOptimization] = useState('distance');

  // Node selection from graph clicks
  const handleSelectNode = (nodeId, type) => {
    if (type === 'source') {
      setSource(nodeId);
      if (destination === nodeId) {
        setDestination('');
      }
      clearRoute();
    } else if (type === 'destination') {
      if (nodeId !== source) {
        setDestination(nodeId);
      }
    }
  };

  const handleCalculate = async () => {
    if (!source || !destination) return;
    await calculateRoute(source, destination, optimization);
  };

  const handleReset = () => {
    setSource('');
    setDestination('');
    clearRoute();
  };

  if (networkLoading && nodes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner message="Loading network topology for route planner..." size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Network or Calculation Error Alerts */}
      {networkError && (
        <ErrorMessage
          title="Network Connection Alert"
          message={networkError}
          onRetry={refetchNetwork}
        />
      )}
      {calcError && (
        <ErrorMessage
          title="Route Computation Notice"
          message={calcError}
          onRetry={source && destination ? handleCalculate : undefined}
        />
      )}

      {/* Main 3-Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Panel: Controls (Col span 3) */}
        <div className="lg:col-span-3">
          <ControlPanel
            nodes={nodes}
            source={source}
            setSource={setSource}
            destination={destination}
            setDestination={setDestination}
            optimization={optimization}
            setOptimization={setOptimization}
            onCalculate={handleCalculate}
            onReset={handleReset}
            loading={calculating}
            blockedRoads={blockedRoads}
            onUnblockRoad={toggleBlockRoad}
            onUnblockAll={unblockAll}
          />
        </div>

        {/* Center Panel: SVG Graph Visualization (Col span 6) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="h-[540px]">
            <NetworkGraph
              nodes={nodes}
              roads={roads}
              source={source}
              destination={destination}
              onSelectNode={handleSelectNode}
              blockedRoads={blockedRoads}
              onToggleBlockRoad={toggleBlockRoad}
              currentRoute={currentRoute}
              alternatives={alternatives}
            />
          </div>
          {/* Legend Component directly underneath Center Graph */}
          <Legend />
        </div>

        {/* Right Panel: Route Summary & Breakdown (Col span 3) */}
        <div className="lg:col-span-3">
          <RouteInfo
            currentRoute={currentRoute}
            alternatives={alternatives}
            blockedRoads={blockedRoads}
          />
        </div>
      </div>
    </div>
  );
}
