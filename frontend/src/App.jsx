import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import RoutePlanner from './pages/RoutePlanner';
import NetworkExplorerPage from './pages/NetworkExplorerPage';
import TrafficSimulationPage from './pages/TrafficSimulationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

import { useNetwork } from './hooks/useNetwork';
import { useRouteCalculation } from './hooks/useRouteCalculation';

export default function App() {
  const [activePage, setActivePage] = useState('overview');

  // Network topology hook
  const network = useNetwork();

  // Route calculation & session history hook
  const routeCalc = useRouteCalculation(network.blockedRoads);

  // Render appropriate page content based on activePage state
  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <Overview
            networkState={network}
            routeHistory={routeCalc.history}
            setActivePage={setActivePage}
          />
        );

      case 'route-planner':
        return (
          <RoutePlanner
            networkState={network}
            routeCalculationState={routeCalc}
          />
        );

      case 'network-explorer':
        return <NetworkExplorerPage networkState={network} />;

      case 'traffic-simulation':
        return <TrafficSimulationPage networkState={network} />;

      case 'analytics':
        return (
          <AnalyticsPage
            history={routeCalc.history}
            blockedRoads={network.blockedRoads}
            totalRoads={network.stats.totalRoads}
            setActivePage={setActivePage}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            isConnected={network.isConnected}
            onRefreshNetwork={network.refetchNetwork}
          />
        );

      default:
        return (
          <Overview
            networkState={network}
            routeHistory={routeCalc.history}
            setActivePage={setActivePage}
          />
        );
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      isConnected={network.isConnected}
      isLoading={network.loading}
      onRefresh={network.refetchNetwork}
      blockedRoadCount={network.blockedRoads.length}
    >
      {renderPage()}
    </Layout>
  );
}
