/**
 * Utility helper functions for FlowShift
 */

/**
 * Format distance in kilometers
 * @param {number|string} km
 * @returns {string}
 */
export function formatDistance(km) {
  if (km === null || km === undefined || isNaN(km)) return '0 km';
  const val = Number(km);
  return `${val.toFixed(val % 1 === 0 ? 0 : 1)} km`;
}

/**
 * Format time in minutes to readable format ("X min" or "X hr Y min")
 * @param {number|string} minutes
 * @returns {string}
 */
export function formatTime(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return '0 min';
  const totalMin = Math.round(Number(minutes));
  if (totalMin < 60) {
    return `${totalMin} min`;
  }
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

/**
 * Get a consistent road identifier string regardless of direction
 * E.g., getRoadId('B', 'A') -> 'A-B'
 * @param {string} node1
 * @param {string} node2
 * @returns {string}
 */
export function getRoadId(node1, node2) {
  if (!node1 || !node2) return '';
  const s1 = String(node1).trim();
  const s2 = String(node2).trim();
  return s1 < s2 ? `${s1}-${s2}` : `${s2}-${s1}`;
}

/**
 * Check if a road is currently blocked
 * @param {Object|string} road - Road object or roadId string
 * @param {Array} blockedRoads - Array of blocked road IDs or pair arrays
 * @returns {boolean}
 */
export function isRoadBlocked(road, blockedRoads) {
  if (!blockedRoads || !Array.isArray(blockedRoads) || blockedRoads.length === 0) {
    return false;
  }

  let testId = '';
  let u = '';
  let v = '';

  if (typeof road === 'string') {
    testId = road;
    if (road.includes('-')) {
      const parts = road.split('-');
      u = parts[0];
      v = parts[1];
      testId = getRoadId(u, v);
    }
  } else if (road && typeof road === 'object') {
    const src = road.source ?? road.from ?? road.node1 ?? road.u;
    const dst = road.destination ?? road.to ?? road.node2 ?? road.v;
    if (src && dst) {
      testId = getRoadId(src, dst);
      u = String(src);
      v = String(dst);
    } else if (road.id) {
      testId = String(road.id);
    }
  }

  return blockedRoads.some(b => {
    if (typeof b === 'string') {
      if (b === testId) return true;
      if (b.includes('-')) {
        const [b1, b2] = b.split('-');
        return getRoadId(b1, b2) === testId;
      }
      return false;
    }
    if (Array.isArray(b) && b.length >= 2) {
      return getRoadId(b[0], b[1]) === testId;
    }
    if (b && typeof b === 'object') {
      const bSrc = b.source ?? b.from ?? b.node1 ?? b.u;
      const bDst = b.destination ?? b.to ?? b.node2 ?? b.v;
      if (bSrc && bDst) {
        return getRoadId(bSrc, bDst) === testId;
      }
      if (b.id) return b.id === testId;
    }
    return false;
  });
}

/**
 * Calculate the 2D midpoint of an edge
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {{x: number, y: number}}
 */
export function getEdgeMidpoint(x1, y1, x2, y2) {
  return {
    x: (Number(x1) + Number(x2)) / 2,
    y: (Number(y1) + Number(y2)) / 2,
  };
}

/**
 * Check if a road segment is part of a route path
 * @param {string} u
 * @param {string} v
 * @param {Array<string>} path
 * @returns {boolean}
 */
export function isEdgeInPath(u, v, path) {
  if (!path || !Array.isArray(path) || path.length < 2) return false;
  const targetId = getRoadId(u, v);
  for (let i = 0; i < path.length - 1; i++) {
    if (getRoadId(path[i], path[i + 1]) === targetId) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize road source/destination endpoints
 * @param {Object} road
 * @returns {{source: string, destination: string, distance: number, time: number, id: string, name: string}}
 */
export function normalizeRoad(road) {
  const source = String(road.source ?? road.from ?? road.node1 ?? road.u ?? '');
  const destination = String(road.destination ?? road.to ?? road.node2 ?? road.v ?? '');
  const distance = Number(road.distance ?? road.length ?? road.weight ?? 0);
  const time = Number(road.time ?? road.travel_time ?? road.duration ?? (distance * 1.5));
  const id = road.id ? String(road.id) : getRoadId(source, destination);
  const name = road.name || `${source}–${destination} Connector`;

  return {
    ...road,
    id,
    source,
    destination,
    distance,
    time,
    name,
  };
}

/**
 * Normalize node object
 * @param {Object} node
 * @returns {{id: string, name: string, x: number, y: number}}
 */
export function normalizeNode(node) {
  const id = String(node.id ?? node.code ?? node.key ?? '');
  const name = node.name ?? node.label ?? `Intersection ${id}`;
  const x = Number(node.x ?? node.cx ?? 0);
  const y = Number(node.y ?? node.cy ?? 0);

  return {
    ...node,
    id,
    name,
    x,
    y,
  };
}
