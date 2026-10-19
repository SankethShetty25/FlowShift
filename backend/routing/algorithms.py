"""
Algorithm Engine for FlowShift Road Network.

Provides route calculation using Dijkstra's shortest path algorithm via NetworkX,
alternative route exploration via edge-blocking heuristics, travel metrics summation,
and node connectivity analysis.
"""
from typing import Any, Dict, List, Optional
import networkx as nx

from .graph import (
    NODES,
    build_graph,
    normalize_road_key,
)


def calculate_route_distance(graph: nx.Graph, path: List[str]) -> float:
    """
    Calculates total road distance along a sequential node path in kilometers.
    """
    if not path or len(path) < 2:
        return 0.0

    total_dist = 0.0
    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        if graph.has_edge(u, v):
            total_dist += graph[u][v].get("distance", 0.0)
    return round(total_dist, 2)


def calculate_route_travel_time(graph: nx.Graph, path: List[str]) -> float:
    """
    Calculates total travel time along a sequential node path in minutes.
    """
    if not path or len(path) < 2:
        return 0.0

    total_time = 0.0
    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        if graph.has_edge(u, v):
            total_time += graph[u][v].get("travel_time", 0.0)
    return round(total_time, 2)


def build_route_segments(graph: nx.Graph, path: List[str]) -> List[Dict[str, Any]]:
    """
    Constructs a detailed list of road segment objects along a path.
    """
    segments = []
    if not path or len(path) < 2:
        return segments

    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        if graph.has_edge(u, v):
            edge = graph[u][v]
            segments.append({
                "from_node": u,
                "to_node": v,
                "name": edge.get("name", f"{u}-{v}"),
                "distance": edge.get("distance", 0.0),
                "travel_time": edge.get("travel_time", 0.0),
                "base_travel_time": edge.get("base_travel_time", 0.0),
                "traffic_multiplier": edge.get("traffic_multiplier", 1.0),
            })
    return segments


def calculate_shortest_route(
    source: str,
    destination: str,
    blocked_roads: Optional[List[Any]] = None,
    optimization: str = "distance",
    traffic_conditions: Optional[Dict[Any, Any]] = None
) -> Dict[str, Any]:
    """
    Calculates the optimal route between source and destination using NetworkX Dijkstra.

    Args:
        source: Origin node ID (e.g. 'A')
        destination: Target node ID (e.g. 'H')
        blocked_roads: List of blocked road segments
        optimization: 'distance' or 'time'/'travel_time'
        traffic_conditions: Road traffic congestion conditions

    Returns:
        Structured dict with success status, path, distance, travel_time, segments, or error.
    """
    source_clean = str(source).strip().upper()
    dest_clean = str(destination).strip().upper()

    if source_clean not in NODES:
        return {
            "success": False,
            "error": f"Source node '{source}' does not exist in the network.",
            "error_type": "NodeNotFound"
        }

    if dest_clean not in NODES:
        return {
            "success": False,
            "error": f"Destination node '{destination}' does not exist in the network.",
            "error_type": "NodeNotFound"
        }

    # Same source and destination edge case
    if source_clean == dest_clean:
        return {
            "success": True,
            "source": source_clean,
            "destination": dest_clean,
            "optimization": optimization,
            "path": [source_clean],
            "distance": 0.0,
            "travel_time": 0.0,
            "segments": [],
            "message": "Source and destination are identical."
        }

    # Determine optimization metric
    weight_key = "travel_time" if optimization in ["time", "travel_time"] else "distance"

    try:
        graph = build_graph(
            blocked_roads=blocked_roads,
            traffic_conditions=traffic_conditions
        )

        path = nx.shortest_path(
            graph,
            source=source_clean,
            target=dest_clean,
            weight=weight_key,
            method="dijkstra"
        )

        distance = calculate_route_distance(graph, path)
        travel_time = calculate_route_travel_time(graph, path)
        segments = build_route_segments(graph, path)

        return {
            "success": True,
            "source": source_clean,
            "destination": dest_clean,
            "optimization": optimization,
            "path": path,
            "distance": distance,
            "travel_time": travel_time,
            "segments": segments
        }

    except nx.NodeNotFound as e:
        return {
            "success": False,
            "error": f"Node not found: {str(e)}",
            "error_type": "NodeNotFound"
        }
    except nx.NetworkXNoPath:
        return {
            "success": False,
            "error": f"No available route between '{source_clean}' and '{dest_clean}' with current road closures.",
            "error_type": "NoPath"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to compute route: {str(e)}",
            "error_type": "GeneralError"
        }


def get_alternative_routes(
    source: str,
    destination: str,
    blocked_roads: Optional[List[Any]] = None,
    primary_path: Optional[List[str]] = None,
    optimization: str = "distance",
    traffic_conditions: Optional[Dict[Any, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Finds up to 2 distinct alternative routes by temporarily blocking edges
    in the primary path one at a time.
    """
    source_clean = str(source).strip().upper()
    dest_clean = str(destination).strip().upper()

    # Determine primary path if not supplied
    if not primary_path:
        primary_result = calculate_shortest_route(
            source=source_clean,
            destination=dest_clean,
            blocked_roads=blocked_roads,
            optimization=optimization,
            traffic_conditions=traffic_conditions
        )
        if not primary_result.get("success"):
            return []
        primary_path = primary_result.get("path", [])

    if len(primary_path) <= 1:
        return []

    base_blocked = list(blocked_roads) if blocked_roads else []
    candidates = []
    seen_paths = [tuple(primary_path)]

    # Iterate over segments in primary path
    for i in range(len(primary_path) - 1):
        u, v = primary_path[i], primary_path[i + 1]
        temp_blocked = base_blocked + [[u, v]]

        alt_result = calculate_shortest_route(
            source=source_clean,
            destination=dest_clean,
            blocked_roads=temp_blocked,
            optimization=optimization,
            traffic_conditions=traffic_conditions
        )

        if alt_result.get("success"):
            alt_path = alt_result["path"]
            path_tuple = tuple(alt_path)
            if path_tuple not in seen_paths:
                seen_paths.append(path_tuple)
                alt_result["bypassed_road"] = [u, v]
                alt_result["description"] = f"Alternative bypassing {u}-{v}"
                candidates.append(alt_result)

    # Sort alternatives by optimization criteria
    sort_key = "travel_time" if optimization in ["time", "travel_time"] else "distance"
    candidates.sort(key=lambda r: r.get(sort_key, 0.0))

    return candidates[:2]


def get_node_connectivity(
    node_id: str,
    blocked_roads: Optional[List[Any]] = None
) -> Dict[str, Any]:
    """
    Returns connectivity info (neighbors, degree, and edge details) for a specific node.
    """
    node_clean = str(node_id).strip().upper()

    if node_clean not in NODES:
        return {
            "success": False,
            "error": f"Node '{node_id}' does not exist in the network.",
            "error_type": "NodeNotFound"
        }

    graph = build_graph(blocked_roads=blocked_roads)
    node_data = NODES[node_clean]

    edges = []
    connected_nodes = []
    if graph.has_node(node_clean):
        for neighbor in sorted(graph.neighbors(node_clean)):
            edge_data = graph[node_clean][neighbor]
            connected_nodes.append(neighbor)
            edges.append({
                "neighbor_id": neighbor,
                "neighbor_label": NODES.get(neighbor, {}).get("label", neighbor),
                "road_name": edge_data.get("name", f"{node_clean}-{neighbor}"),
                "distance": edge_data.get("distance", 0.0),
                "travel_time": edge_data.get("travel_time", 0.0),
                "traffic_multiplier": edge_data.get("traffic_multiplier", 1.0),
            })

    return {
        "success": True,
        "node_id": node_clean,
        "label": node_data["label"],
        "x": node_data["x"],
        "y": node_data["y"],
        "degree": len(connected_nodes),
        "connected_nodes": connected_nodes,
        "edges": edges
    }
