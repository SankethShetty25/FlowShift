import React, { useState, useMemo } from 'react';
import {
  Search,
  Network,
  Milestone,
  Clock,
  ArrowRight,
  Shield,
  Ban,
  CheckCircle,
  ExternalLink,
  Info,
} from 'lucide-react';
import { formatDistance, formatTime, isRoadBlocked, getRoadId } from '../../utils/helpers';
import StatCard from '../dashboard/StatCard';

export default function NetworkExplorer({
  nodes = [],
  roads = [],
  blockedRoads = [],
  onToggleBlockRoad,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [activeTab, setActiveTab] = useState('roads'); // 'roads' | 'nodes'

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return nodes;
    const term = searchTerm.toLowerCase();
    return nodes.filter(
      (n) =>
        String(n.id).toLowerCase().includes(term) ||
        String(n.name || '').toLowerCase().includes(term)
    );
  }, [nodes, searchTerm]);

  // Filtered roads
  const filteredRoads = useMemo(() => {
    if (!searchTerm.trim()) return roads;
    const term = searchTerm.toLowerCase();
    return roads.filter(
      (r) =>
        String(r.name || '').toLowerCase().includes(term) ||
        String(r.source || '').toLowerCase().includes(term) ||
        String(r.destination || '').toLowerCase().includes(term) ||
        getRoadId(r.source, r.destination).toLowerCase().includes(term)
    );
  }, [roads, searchTerm]);

  // Network metrics
  const avgDistance = useMemo(() => {
    if (roads.length === 0) return 0;
    const total = roads.reduce((sum, r) => sum + (Number(r.distance) || 0), 0);
    return (total / roads.length).toFixed(1);
  }, [roads]);

  // Connected roads for selected node
  const nodeConnections = useMemo(() => {
    if (!selectedNode) return [];
    return roads.filter(
      (r) => r.source === selectedNode.id || r.destination === selectedNode.id
    );
  }, [selectedNode, roads]);

  return (
    <div className="space-y-6">
      {/* Top Network Statistics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Network}
          label="Intersections"
          value={nodes.length}
          subtitle="Network vertices"
          colorScheme="blue"
        />
        <StatCard
          icon={Milestone}
          label="Road Segments"
          value={roads.length}
          subtitle="Physical connections"
          colorScheme="purple"
        />
        <StatCard
          icon={Clock}
          label="Avg Road Length"
          value={`${avgDistance} km`}
          subtitle="Mean transit span"
          colorScheme="emerald"
        />
        <StatCard
          icon={Shield}
          label="Network Reliability"
          value={
            roads.length > 0
              ? `${Math.round(((roads.length - blockedRoads.length) / roads.length) * 100)}%`
              : '100%'
          }
          subtitle={`${blockedRoads.length} closures recorded`}
          colorScheme={blockedRoads.length > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Explorer Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Tab switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('roads')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'roads'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roads Directory ({filteredRoads.length})
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'nodes'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Intersections Grid ({filteredNodes.length})
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by street name, intersection, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ROADS TABLE VIEW */}
      {activeTab === 'roads' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Road Name / ID</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Base Travel Time</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoads.map((road) => {
                  const roadId = getRoadId(road.source, road.destination);
                  const isBlocked = isRoadBlocked(road, blockedRoads);
                  return (
                    <tr
                      key={roadId}
                      className="hover:bg-slate-50/70 transition cursor-pointer"
                      onClick={() => setSelectedRoad(road)}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {road.name || `Corridor ${roadId}`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-slate-100 text-slate-700 font-bold">
                          {road.source}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-slate-100 text-slate-700 font-bold">
                          {road.destination}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatDistance(road.distance)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatTime(road.time)}
                      </td>
                      <td className="py-3 px-4">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                            <Ban className="h-3 w-3" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBlockRoad && onToggleBlockRoad(roadId);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            isBlocked
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isBlocked ? 'Unblock' : 'Block Road'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NODES CARD GRID VIEW */}
      {activeTab === 'nodes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNodes.map((node) => {
            const connectedRoads = roads.filter(
              (r) => r.source === node.id || r.destination === node.id
            );
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm shadow-sm">
                      {node.id}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {connectedRoads.length} branches
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">{node.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Coord: ({Math.round(node.x || 0)}, {Math.round(node.y || 0)})
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Node Details Modal / Drawer */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
                  {selectedNode.id}
                </span>
                <h3 className="font-bold text-slate-900">{selectedNode.name}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Intersection ID</span>
                <span className="font-semibold text-slate-800">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Degree / Incident Edges</span>
                <span className="font-semibold text-slate-800">{nodeConnections.length} corridors</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Canvas Position</span>
                <span className="font-mono text-slate-700">
                  X: {Math.round(selectedNode.x || 0)} | Y: {Math.round(selectedNode.y || 0)}
                </span>
              </div>

              <div>
                <p className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-2 mt-3">
                  Direct Connections
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {nodeConnections.map((r) => {
                    const otherNode = r.source === selectedNode.id ? r.destination : r.source;
                    const isBlocked = isRoadBlocked(r, blockedRoads);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100"
                      >
                        <span className="font-medium text-slate-800">
                          To Node {otherNode} ({r.name || 'Connector'})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-500">{formatDistance(r.distance)}</span>
                          {isBlocked && (
                            <span className="text-[10px] text-red-600 font-semibold bg-red-100 px-1.5 py-0.5 rounded">
                              Blocked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
