import React, { useState, useMemo } from 'react';
import { isRoadBlocked, isEdgeInPath, getRoadId, formatDistance, formatTime } from '../../utils/helpers';
import { ZoomIn, ZoomOut, Maximize2, Info, AlertTriangle } from 'lucide-react';

export default function NetworkGraph({
  nodes = [],
  roads = [],
  source = '',
  destination = '',
  onSelectNode,
  blockedRoads = [],
  onToggleBlockRoad,
  currentRoute = null,
  alternatives = [],
  trafficConditions = {},
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredRoad, setHoveredRoad] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // SVG dimensions
  const SVG_WIDTH = 1050;
  const SVG_HEIGHT = 550;
  const PADDING_X = 90;
  const PADDING_Y = 60;

  // Compute scaled coordinate map for nodes
  const nodeMap = useMemo(() => {
    if (!nodes || nodes.length === 0) return new Map();

    // Check if coordinates exist
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      const x = Number(n.x ?? 0);
      const y = Number(n.y ?? 0);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;

    // Check if coordinates already match our SVG viewBox range (~50 to ~1000)
    const isAlreadySvgScale = minX >= 0 && maxX <= SVG_WIDTH && minY >= 0 && maxY <= SVG_HEIGHT && spanX > 300;

    const map = new Map();
    nodes.forEach((n, idx) => {
      let finalX = Number(n.x ?? 0);
      let finalY = Number(n.y ?? 0);

      if (!isAlreadySvgScale) {
        if (spanX > 0 && spanY > 0 && (maxX > 1 || maxY > 1)) {
          // Linear mapping into viewBox with padding
          finalX = PADDING_X + ((finalX - minX) / spanX) * (SVG_WIDTH - 2 * PADDING_X);
          finalY = PADDING_Y + ((finalY - minY) / spanY) * (SVG_HEIGHT - 2 * PADDING_Y);
        } else {
          // Circular fallback layout if coordinates are missing or all 0
          const angle = (idx / nodes.length) * 2 * Math.PI;
          finalX = SVG_WIDTH / 2 + Math.cos(angle) * 360;
          finalY = SVG_HEIGHT / 2 + Math.sin(angle) * 190;
        }
      }

      map.set(String(n.id), {
        ...n,
        x: finalX,
        y: finalY,
      });
    });

    return map;
  }, [nodes]);

  // Extract primary route path and alternative paths
  const routePath = useMemo(() => currentRoute?.path || [], [currentRoute]);
  const primaryRouteEdgeIds = useMemo(() => {
    const ids = new Set();
    if (routePath.length >= 2) {
      for (let i = 0; i < routePath.length - 1; i++) {
        ids.add(getRoadId(routePath[i], routePath[i + 1]));
      }
    }
    return ids;
  }, [routePath]);

  const altRouteEdgeIds = useMemo(() => {
    const ids = new Set();
    alternatives.forEach((alt) => {
      const p = alt.path || [];
      for (let i = 0; i < p.length - 1; i++) {
        const edgeId = getRoadId(p[i], p[i + 1]);
        if (!primaryRouteEdgeIds.has(edgeId)) {
          ids.add(edgeId);
        }
      }
    });
    return ids;
  }, [alternatives, primaryRouteEdgeIds]);

  // Handle clicking on node
  const handleNodeClick = (nodeId) => {
    if (!onSelectNode) return;
    if (!source || (source && destination)) {
      onSelectNode(nodeId, 'source');
    } else if (source && !destination) {
      if (nodeId !== source) {
        onSelectNode(nodeId, 'destination');
      }
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative flex flex-col h-full w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden select-none">
      {/* Canvas Top Bar Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600">
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Interactive Graph
        </span>
        <span className="text-slate-300">|</span>
        <span>{nodes.length} intersections</span>
        <span className="text-slate-300">|</span>
        <span>{roads.length} corridors</span>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.75))}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          title="Reset Zoom"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Main SVG Visualization */}
      <div
        className="flex-1 w-full h-full min-h-[460px] flex items-center justify-center bg-slate-900/5 relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="35" height="35" patternUnits="userSpaceOnUse">
              <path
                d="M 35 0 L 0 0 0 35"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="0.8"
                opacity="0.8"
              />
            </pattern>

            {/* Glowing route filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Marker for directed route flows */}
            <marker
              id="arrow-emerald"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* LAYER 1: ROADS (EDGES) */}
          <g className="edges-layer">
            {roads.map((road) => {
              const u = String(road.source ?? road.from ?? road.node1 ?? '');
              const v = String(road.destination ?? road.to ?? road.node2 ?? '');
              const roadId = getRoadId(u, v);

              const nodeA = nodeMap.get(u);
              const nodeB = nodeMap.get(v);

              if (!nodeA || !nodeB) return null;

              const isBlocked = isRoadBlocked(road, blockedRoads);
              const isPrimaryRoute = primaryRouteEdgeIds.has(roadId);
              const isAltRoute = altRouteEdgeIds.has(roadId);
              const isHovered = hoveredRoad === roadId;

              const midX = (nodeA.x + nodeB.x) / 2;
              const midY = (nodeA.y + nodeB.y) / 2;

              // Determine visual styling according to rules:
              // Normal: stroke #94a3b8, strokeWidth 2
              // Route path: stroke #22c55e, strokeWidth 3.5, with animated dash
              // Alternative route: stroke #3b82f6, strokeWidth 2.5, dasharray "8,4"
              // Blocked: stroke #ef4444, strokeWidth 2, dasharray "6,4", with an X icon at midpoint
              let strokeColor = '#94a3b8';
              let strokeWidth = 2.2;
              let strokeDasharray = 'none';
              let isAnimated = false;

              if (isBlocked) {
                strokeColor = '#ef4444';
                strokeWidth = 2.5;
                strokeDasharray = '6,4';
              } else if (isPrimaryRoute) {
                strokeColor = '#22c55e';
                strokeWidth = 4;
                isAnimated = true;
              } else if (isAltRoute) {
                strokeColor = '#3b82f6';
                strokeWidth = 2.8;
                strokeDasharray = '8,4';
              }

              if (isHovered && !isBlocked) {
                strokeWidth += 2;
              }

              return (
                <g
                  key={roadId}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => onToggleBlockRoad && onToggleBlockRoad(roadId)}
                  onMouseEnter={() => setHoveredRoad(roadId)}
                  onMouseLeave={() => setHoveredRoad(null)}
                >
                  {/* Invisible thicker stroke for effortless click/hover targeting */}
                  <line
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke="transparent"
                    strokeWidth="18"
                  />

                  {/* Base Road Line */}
                  <line
                    x1={nodeA.x}
                    y1={nodeA.y}
                    x2={nodeB.x}
                    y2={nodeB.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    filter={isPrimaryRoute ? 'url(#routeGlow)' : undefined}
                  />

                  {/* Animated dash line overlay for calculated route */}
                  {isAnimated && (
                    <line
                      x1={nodeA.x}
                      y1={nodeA.y}
                      x2={nodeB.x}
                      y2={nodeB.y}
                      stroke="#ecfdf5"
                      strokeWidth="2"
                      strokeDasharray="6,8"
                      className="animate-flow"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Midpoint Distance Badge & Blocked X marker */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    {isBlocked ? (
                      /* Blocked Road X Indicator */
                      <g className="animate-pulse">
                        <circle cx="0" cy="0" r="10" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fill="#ef4444"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          ✕
                        </text>
                      </g>
                    ) : (
                      /* Distance Label Badge */
                      <g>
                        <rect
                          x="-22"
                          y="-9"
                          width="44"
                          height="18"
                          rx="9"
                          fill="#ffffff"
                          stroke={isPrimaryRoute ? '#10b981' : '#cbd5e1'}
                          strokeWidth="1"
                          className="shadow-sm"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={isPrimaryRoute ? '#047857' : '#475569'}
                          fontSize="9.5"
                          fontWeight="600"
                        >
                          {formatDistance(road.distance)}
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          {/* LAYER 2: NODES (INTERSECTIONS) */}
          <g className="nodes-layer">
            {nodes.map((node) => {
              const mappedNode = nodeMap.get(String(node.id));
              if (!mappedNode) return null;

              const isSource = source === node.id;
              const isDest = destination === node.id;
              const isOnRoute = routePath.includes(node.id);
              const isHovered = hoveredNode?.id === node.id;

              // Node styling:
              // Normal: fill #f1f5f9, stroke #64748b, radius 18
              // Source: fill #22c55e (green), radius 20
              // Destination: fill #ef4444 (red), radius 20
              // On route: fill #86efac (light green), radius 18
              // Hovered: slight scale up
              let fill = '#f8fafc';
              let stroke = '#64748b';
              let strokeWidth = 2.5;
              let radius = 18;
              let textColor = '#1e293b';

              if (isSource) {
                fill = '#22c55e';
                stroke = '#15803d';
                strokeWidth = 3;
                radius = 21;
                textColor = '#ffffff';
              } else if (isDest) {
                fill = '#ef4444';
                stroke = '#b91c1c';
                strokeWidth = 3;
                radius = 21;
                textColor = '#ffffff';
              } else if (isOnRoute) {
                fill = '#86efac';
                stroke = '#16a34a';
                strokeWidth = 2.5;
                radius = 19;
                textColor = '#064e3b';
              }

              if (isHovered) {
                radius += 3;
                strokeWidth += 1;
              }

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredNode(mappedNode)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Subtle drop shadow ring */}
                  <circle
                    cx={mappedNode.x}
                    cy={mappedNode.y}
                    r={radius + 3}
                    fill={isSource || isDest ? (isSource ? '#bbf7d0' : '#fecaca') : 'transparent'}
                    opacity={0.6}
                  />

                  {/* Main Node Circle */}
                  <circle
                    cx={mappedNode.x}
                    cy={mappedNode.y}
                    r={radius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="transition-transform duration-100"
                  />

                  {/* Node ID Letter (Bold inside circle) */}
                  <text
                    x={mappedNode.x}
                    y={mappedNode.y + 4.5}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {node.id}
                  </text>

                  {/* Full Intersection Name Below Circle */}
                  <text
                    x={mappedNode.x}
                    y={mappedNode.y + radius + 15}
                    textAnchor="middle"
                    fill="#334155"
                    fontSize="10"
                    fontWeight="600"
                    className="select-none"
                  >
                    {node.name || `Node ${node.id}`}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip for Nodes */}
        {hoveredNode && (
          <div
            className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-md"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 12}px`,
            }}
          >
            <p className="font-bold text-emerald-400">
              Intersection {hoveredNode.id}: {hoveredNode.name}
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Click to set as {source === hoveredNode.id ? 'active source' : !source ? 'Source Origin' : 'Destination'}
            </p>
          </div>
        )}

        {/* Hover Tooltip for Roads */}
        {hoveredRoad && (
          <div
            className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full mb-3 rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs text-white shadow-xl backdrop-blur-md"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 12}px`,
            }}
          >
            <p className="font-bold text-white flex items-center gap-1.5">
              Corridor {hoveredRoad}
              {isRoadBlocked(hoveredRoad, blockedRoads) && (
                <span className="text-red-400 font-normal">(Blocked)</span>
              )}
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Click to {isRoadBlocked(hoveredRoad, blockedRoads) ? 'unblock' : 'simulate blockage'}
            </p>
          </div>
        )}
      </div>

      {/* Helper Footer Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          Click nodes to choose origin & destination • Click edges to block/unblock roads
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Scale: 1050 × 550 SVG
        </span>
      </div>
    </div>
  );
}
