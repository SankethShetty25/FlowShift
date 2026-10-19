import { useState, useEffect, useCallback } from 'react';
import { fetchNetwork } from '../services/api';
import { normalizeNode, normalizeRoad, getRoadId, isRoadBlocked } from '../utils/helpers';

export function useNetwork() {
  const [nodes, setNodes] = useState([]);
  const [roads, setRoads] = useState([]);
  const [rawStats, setRawStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blockedRoads, setBlockedRoads] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const loadNetwork = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNetwork();
      
      // Backend returns nodes_list as array and nodes as dict — prefer array form
      let rawNodes = data.nodes_list || data.nodes || data.intersections || [];
      const rawRoads = data.roads || data.edges || [];

      // Handle dict format: {A: {label, x, y}, B: ...} → array
      if (rawNodes && !Array.isArray(rawNodes) && typeof rawNodes === 'object') {
        rawNodes = Object.entries(rawNodes).map(([id, info]) => ({
          id,
          ...info,
        }));
      }

      const parsedNodes = rawNodes.map(normalizeNode);
      const parsedRoads = rawRoads.map(normalizeRoad);

      setNodes(parsedNodes);
      setRoads(parsedRoads);
      setRawStats(data.stats || null);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load network:', err);
      setError(err.message || 'Failed to load network graph from server.');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  const toggleBlockRoad = useCallback((roadInput) => {
    let roadId = '';
    if (typeof roadInput === 'string') {
      roadId = roadInput;
      if (roadInput.includes('-')) {
        const [u, v] = roadInput.split('-');
        roadId = getRoadId(u, v);
      }
    } else if (roadInput && typeof roadInput === 'object') {
      const u = roadInput.source ?? roadInput.from ?? roadInput.node1 ?? roadInput.u;
      const v = roadInput.destination ?? roadInput.to ?? roadInput.node2 ?? roadInput.v;
      if (u && v) {
        roadId = getRoadId(u, v);
      } else if (roadInput.id) {
        roadId = roadInput.id;
      }
    }

    if (!roadId) return;

    setBlockedRoads((prev) => {
      const alreadyBlocked = isRoadBlocked(roadId, prev);
      if (alreadyBlocked) {
        return prev.filter((b) => {
          if (typeof b === 'string') {
            const bId = b.includes('-') ? getRoadId(...b.split('-')) : b;
            return bId !== roadId;
          }
          if (Array.isArray(b) && b.length >= 2) {
            return getRoadId(b[0], b[1]) !== roadId;
          }
          return true;
        });
      } else {
        return [...prev, roadId];
      }
    });
  }, []);

  const unblockAll = useCallback(() => {
    setBlockedRoads([]);
  }, []);

  // Compute live statistics based on state
  const totalIntersections = nodes.length;
  const totalRoads = roads.length;
  const blockedRoadCount = blockedRoads.length;
  const availableRoads = Math.max(0, totalRoads - blockedRoadCount);

  return {
    nodes,
    roads,
    stats: {
      totalIntersections: rawStats?.total_nodes ?? rawStats?.total_intersections ?? totalIntersections,
      totalRoads: rawStats?.total_roads ?? rawStats?.total_edges ?? totalRoads,
      availableRoads,
      blockedCount: blockedRoadCount,
      ...rawStats,
    },
    blockedRoads,
    toggleBlockRoad,
    unblockAll,
    loading,
    error,
    isConnected,
    refetchNetwork: loadNetwork,
  };
}
