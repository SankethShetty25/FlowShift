import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout({
  children,
  activePage,
  setActivePage,
  isConnected,
  isLoading,
  onRefresh,
  blockedRoadCount = 0,
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Primary Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main App Workspace */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Navigation */}
        <TopNav
          activePage={activePage}
          isConnected={isConnected}
          isLoading={isLoading}
          onRefresh={onRefresh}
          blockedRoadCount={blockedRoadCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
