import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Extract clean error message from response
 * @param {Error} error
 * @returns {string}
 */
const getErrorMessage = (error) => {
  if (error.response) {
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        return error.response.data;
      }
      if (error.response.data.error) {
        return error.response.data.error;
      }
      if (error.response.data.message) {
        return error.response.data.message;
      }
      if (error.response.data.detail) {
        return error.response.data.detail;
      }
    }
    return `Server Error (${error.response.status}): ${error.response.statusText}`;
  }
  if (error.request) {
    return 'Unable to reach backend at http://localhost:8000. Please ensure the Django server is running.';
  }
  return error.message || 'An unexpected error occurred.';
};

/**
 * Fetch full network graph data (nodes, roads, stats)
 * GET /network/
 */
export async function fetchNetwork() {
  try {
    const response = await apiClient.get('/network/');
    return response.data;
  } catch (error) {
    const enhancedError = new Error(getErrorMessage(error));
    enhancedError.original = error;
    throw enhancedError;
  }
}

/**
 * Calculate optimal route between source and destination
 * POST /route/
 * @param {string} source
 * @param {string} destination
 * @param {Array} blockedRoads
 * @param {string} optimization - 'distance' | 'time'
 * @param {Object} trafficConditions - { [roadId]: 'low'|'moderate'|'heavy' }
 */
export async function calculateRoute(
  source,
  destination,
  blockedRoads = [],
  optimization = 'distance',
  trafficConditions = {}
) {
  try {
    const payload = {
      source,
      destination,
      blocked_roads: blockedRoads,
      blockedRoads: blockedRoads, // compatibility
      optimization,
      traffic_conditions: trafficConditions,
      trafficConditions: trafficConditions,
    };
    const response = await apiClient.post('/route/', payload);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(getErrorMessage(error));
    enhancedError.original = error;
    throw enhancedError;
  }
}

/**
 * Fetch alternative route candidates
 * POST /route/alternatives/
 * @param {string} source
 * @param {string} destination
 * @param {Array} blockedRoads
 * @param {string} optimization
 * @param {Object} trafficConditions
 */
export async function fetchAlternatives(
  source,
  destination,
  blockedRoads = [],
  optimization = 'distance',
  trafficConditions = {}
) {
  try {
    const payload = {
      source,
      destination,
      blocked_roads: blockedRoads,
      blockedRoads: blockedRoads,
      optimization,
      traffic_conditions: trafficConditions,
      trafficConditions: trafficConditions,
    };
    const response = await apiClient.post('/route/alternatives/', payload);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(getErrorMessage(error));
    enhancedError.original = error;
    throw enhancedError;
  }
}

/**
 * Fetch specific node details and its incident roads
 * GET /network/node/{nodeId}/
 * @param {string} nodeId
 */
export async function fetchNodeInfo(nodeId) {
  try {
    const response = await apiClient.get(`/network/node/${encodeURIComponent(nodeId)}/`);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(getErrorMessage(error));
    enhancedError.original = error;
    throw enhancedError;
  }
}

/**
 * Simulate traffic congestion and recalculate route
 * POST /simulate/traffic/
 * @param {string} source
 * @param {string} destination
 * @param {Object} trafficConditions
 * @param {Array} blockedRoads
 */
export async function simulateTraffic(
  source,
  destination,
  trafficConditions = {},
  blockedRoads = []
) {
  try {
    const payload = {
      source,
      destination,
      traffic_conditions: trafficConditions,
      trafficConditions: trafficConditions,
      blocked_roads: blockedRoads,
      blockedRoads: blockedRoads,
    };
    const response = await apiClient.post('/simulate/traffic/', payload);
    return response.data;
  } catch (error) {
    const enhancedError = new Error(getErrorMessage(error));
    enhancedError.original = error;
    throw enhancedError;
  }
}

/**
 * Health check ping to backend
 */
export async function checkBackendHealth() {
  try {
    const response = await apiClient.get('/network/', { timeout: 3000 });
    return { ok: true, status: response.status };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export default apiClient;
