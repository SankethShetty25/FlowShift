import React, { useState } from 'react';
import {
  Settings,
  Server,
  Cpu,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Code2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export default function SettingsPage({
  isConnected,
  onRefreshNetwork,
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await checkBackendHealth();
      setTestResult(result);
      if (result.ok && onRefreshNetwork) {
        onRefreshNetwork();
      }
    } catch (err) {
      setTestResult({ ok: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">System Diagnostics & Configuration</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review backend engine endpoints, operational status, and technology dependencies.
        </p>
      </div>

      {/* Backend API Connectivity Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Server className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Backend API Gateway</h3>
              <p className="text-xs text-slate-500">Django REST Framework Connection</p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                Active Link
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-600" />
                Connection Unavailable
              </>
            )}
          </span>
        </div>

        <div className="py-4 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100">
            <div>
              <span className="font-semibold text-slate-800">Target Base URL</span>
              <p className="text-slate-500 text-[11px]">Direct endpoint for network data and routing</p>
            </div>
            <code className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-slate-800 border border-slate-200">
              {API_URL}
            </code>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100">
            <div>
              <span className="font-semibold text-slate-800">CORS Policy</span>
              <p className="text-slate-500 text-[11px]">Configured to permit local origins (http://localhost:5173)</p>
            </div>
            <span className="font-semibold text-emerald-600">Enabled</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
            <div>
              <span className="font-semibold text-slate-800">Active Routing Algorithms</span>
              <p className="text-slate-500 text-[11px]">Shortest path, fastest time heuristic, alternative paths</p>
            </div>
            <span className="font-semibold text-slate-700">Dijkstra / Yen k-Shortest Paths</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing Endpoint...' : 'Ping Backend API'}
          </button>

          {testResult && (
            <div className="text-xs">
              {testResult.ok ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Connection verified successfully (200 OK)
                </span>
              ) : (
                <span className="text-red-600 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  {testResult.error || 'Server did not respond'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System Specifications Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Application Architecture</h3>
            <p className="text-xs text-slate-500">System modules and client specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              Frontend Stack
            </span>
            <ul className="mt-2 space-y-1.5 font-medium text-slate-700">
              <li>• React 18 (Hooks, Pure Functional Architecture)</li>
              <li>• Vite Build Tool & Hot Module Reload</li>
              <li>• Tailwind CSS v3 Styling Engine</li>
              <li>• Lucide React Iconography</li>
              <li>• Recharts Analytics Visualizer</li>
              <li>• Native SVG Interactive Vector Graph</li>
            </ul>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              Backend Engine
            </span>
            <ul className="mt-2 space-y-1.5 font-medium text-slate-700">
              <li>• Django & Django REST Framework</li>
              <li>• NetworkX Weighted Graph Algorithms</li>
              <li>• Dynamic Reroute Obstacle Avoidance</li>
              <li>• Multi-Criteria Traffic Simulation</li>
              <li>• JSON Serialization Protocols</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
