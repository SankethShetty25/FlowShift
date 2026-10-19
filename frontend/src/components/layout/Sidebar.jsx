import React, { useState } from 'react';
import {
  LayoutDashboard,
  Route,
  Network,
  Activity,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'route-planner', label: 'Route Planner', icon: Route },
    { id: 'network-explorer', label: 'Network Explorer', icon: Network },
    { id: 'traffic-simulation', label: 'Traffic Simulation', icon: Activity },
    { id: 'analytics', label: 'Route Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out border-r border-slate-800 select-none z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
                Flow<span className="text-emerald-400">Shift</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Route Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {!collapsed ? 'Navigation' : '•••'}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={collapsed ? item.label : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                }`}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info / Version */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-300">FlowShift Engine</p>
              <p className="text-[11px] text-slate-400">v1.2.0 • Online</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
}
