import { useState, useCallback } from 'react';
import { calculateRoute as apiCalculateRoute, fetchAlternatives as apiFetchAlternatives } from '../services/api';

export function useRouteCalculation(blockedRoads = []) {
  const [currentRoute, setCurrentRoute] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculate = useCallback(
    async (source, destination, optimization = 'distance', trafficConditions = {}) => {
      if (!source || !destination) {
        setError('Please select both source and destination intersections.');
        return null;
      }

      if (source === destination) {
        setError('Source and destination intersections must be different.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Calculate main route
        const routeData = await apiCalculateRoute(
          source,
          destination,
          blockedRoads,
          optimization,
          trafficConditions
        );

        // Normalize route data
        const path = routeData.path || routeData.route || [];
        const totalDistance = Number(
          routeData.total_distance ?? routeData.totalDistance ?? routeData.distance ?? 0
        );
        const totalTime = Number(
          routeData.total_time ?? routeData.totalTime ?? routeData.travel_time ?? routeData.time ?? 0
        );
        const isRerouted = Boolean(routeData.is_rerouted ?? routeData.isRerouted ?? false);
        const originalDistance = Number(
          routeData.original_distance ?? routeData.originalDistance ?? totalDistance
        );
        const originalTime = Number(
          routeData.original_time ?? routeData.originalTime ?? totalTime
        );
        const segments = routeData.segments || routeData.route_segments || [];
        const blockedRoadsAffected =
          routeData.blocked_roads_affected ||
          routeData.blockedRoadsAffected ||
          routeData.affected_blocks ||
          [];

        const normalizedRoute = {
          source,
          destination,
          path,
          totalDistance,
          totalTime,
          isRerouted,
          originalDistance,
          originalTime,
          segments,
          blockedRoadsAffected,
          optimization,
          timestamp: new Date().toISOString(),
        };

        setCurrentRoute(normalizedRoute);

        // Fetch alternatives in background (don't block main route if it fails)
        try {
          const altData = await apiFetchAlternatives(
            source,
            destination,
            blockedRoads,
            optimization,
            trafficConditions
          );
          const rawAlts = altData.alternatives || altData.routes || [];
          const normalizedAlts = rawAlts
            .filter((alt) => {
              const altPath = alt.path || alt.route || [];
              return JSON.stringify(altPath) !== JSON.stringify(path);
            })
            .slice(0, 2)
            .map((alt, idx) => ({
              id: `alt-${idx + 1}`,
              path: alt.path || alt.route || [],
              totalDistance: Number(alt.total_distance ?? alt.totalDistance ?? alt.distance ?? 0),
              totalTime: Number(alt.total_time ?? alt.totalTime ?? alt.time ?? 0),
              segments: alt.segments || [],
            }));
          setAlternatives(normalizedAlts);
        } catch (altErr) {
          console.warn('Failed to fetch alternative routes:', altErr);
          setAlternatives([]);
        }

        // Add to calculation history for analytics
        setHistory((prev) => [
          {
            id: `route-${Date.now()}`,
            timestamp: new Date(),
            source,
            destination,
            distance: totalDistance,
            time: totalTime,
            isRerouted,
            originalDistance,
            distanceDiff: isRerouted ? totalDistance - originalDistance : 0,
            path,
            optimization,
            stops: Math.max(0, path.length - 1),
          },
          ...prev,
        ]);

        return normalizedRoute;
      } catch (err) {
        console.error('Route calculation error:', err);
        setError(err.message || 'Failed to calculate route. The destination may be unreachable.');
        setCurrentRoute(null);
        setAlternatives([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [blockedRoads]
  );

  const clearRoute = useCallback(() => {
    setCurrentRoute(null);
    setAlternatives([]);
    setError(null);
  }, []);

  return {
    currentRoute,
    alternatives,
    history,
    loading,
    error,
    calculateRoute: calculate,
    clearRoute,
    setError,
  };
}
