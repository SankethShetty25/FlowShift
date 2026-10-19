"""
Graph Engine for FlowShift Road Network.

Defines the road network topology, nodes, road segments, and provides
functions for constructing NetworkX graph representations with dynamic
traffic conditions and blocked roads.
"""
from typing import Dict, List, Optional, Tuple, Any
import networkx as nx

# Defined Urban Road Network Nodes
NODES: Dict[str, Dict[str, Any]] = {
    "A": {"label": "Central Station", "x": 150, "y": 300},
    "B": {"label": "Market Square", "x": 300, "y": 200},
    "C": {"label": "Harbor District", "x": 300, "y": 400},
    "D": {"label": "Tech Park", "x": 450, "y": 150},
    "E": {"label": "University", "x": 450, "y": 300},
    "F": {"label": "City Hospital", "x": 600, "y": 200},
    "G": {"label": "Stadium", "x": 450, "y": 450},
    "H": {"label": "Airport", "x": 750, "y": 300},
    "I": {"label": "Industrial Zone", "x": 750, "y": 450},
    "J": {"label": "Residential Park", "x": 900, "y": 300},
    "K": {"label": "Shopping Mall", "x": 600, "y": 400},
    "L": {"label": "Convention Center", "x": 150, "y": 150},
}

# Road segments: (node1, node2, distance_km, base_travel_time_minutes, road_name)
ROADS: List[Tuple[str, str, int, int, str]] = [
    ("A", "B", 4, 8, "Main Street"),
    ("A", "C", 6, 12, "Harbor Road"),
    ("A", "L", 3, 6, "North Avenue"),
    ("L", "B", 4, 7, "Convention Blvd"),
    ("L", "D", 7, 14, "Express Way"),
    ("B", "D", 3, 6, "Tech Drive"),
    ("B", "E", 5, 10, "University Lane"),
    ("C", "E", 4, 8, "Park Road"),
    ("C", "G", 5, 10, "Stadium Avenue"),
    ("D", "F", 4, 8, "Hospital Road"),
    ("E", "F", 3, 6, "Medical Lane"),
    ("E", "G", 6, 12, "Sports Road"),
    ("E", "K", 4, 8, "Commerce Street"),
    ("F", "H", 3, 6, "Airport Express"),
    ("G", "K", 3, 6, "Mall Connector"),
    ("G", "I", 5, 10, "Industrial Blvd"),
    ("H", "I", 4, 8, "Cargo Route"),
    ("H", "J", 4, 8, "Residential Drive"),
    ("I", "J", 3, 6, "East Highway"),
    ("K", "H", 4, 8, "Transit Road"),
    ("K", "I", 3, 6, "Factory Lane"),
    ("D", "E", 3, 5, "Campus Road"),
]

# Traffic level multipliers
TRAFFIC_MULTIPLIERS: Dict[str, float] = {
    "low": 1.0,
    "moderate": 1.5,
    "heavy": 2.5,
}


def normalize_road_key(road: Any) -> Optional[Tuple[str, str]]:
    """
    Normalizes different road formats into a canonical sorted tuple (u, v).
    Supports:
        - ['A', 'B'] or ('A', 'B')
        - 'A-B', 'A_B', 'A,B', 'A - B'
    """
    if isinstance(road, (list, tuple)) and len(road) >= 2:
        return tuple(sorted([str(road[0]).strip().upper(), str(road[1]).strip().upper()]))
    if isinstance(road, str):
        cleaned = road.strip().upper()
        for sep in ["-", "_", ",", " "]:
            if sep in cleaned:
                parts = [p.strip() for p in cleaned.split(sep) if p.strip()]
                if len(parts) == 2:
                    return tuple(sorted([parts[0], parts[1]]))
    return None


def get_traffic_multiplier_for_road(
    u: str,
    v: str,
    traffic_conditions: Optional[Dict[Any, Any]]
) -> float:
    """
    Looks up the traffic multiplier for a road segment connecting nodes u and v.
    """
    if not traffic_conditions:
        return 1.0

    canonical = tuple(sorted([u.upper(), v.upper()]))
    candidate_keys = [
        f"{canonical[0]}-{canonical[1]}",
        f"{canonical[1]}-{canonical[0]}",
        f"{canonical[0]}_{canonical[1]}",
        f"{canonical[1]}_{canonical[0]}",
        f"{canonical[0]},{canonical[1]}",
        f"{canonical[1]},{canonical[0]}",
        canonical,
        (u.upper(), v.upper()),
        (v.upper(), u.upper()),
    ]

    for key in candidate_keys:
        if key in traffic_conditions:
            val = traffic_conditions[key]
            if isinstance(val, (int, float)):
                return max(0.1, float(val))
            if isinstance(val, str):
                cleaned_val = val.strip().lower()
                if cleaned_val in TRAFFIC_MULTIPLIERS:
                    return TRAFFIC_MULTIPLIERS[cleaned_val]
                try:
                    return max(0.1, float(cleaned_val))
                except ValueError:
                    return 1.0

    return 1.0


def build_graph(
    blocked_roads: Optional[List[Any]] = None,
    traffic_conditions: Optional[Dict[Any, Any]] = None
) -> nx.Graph:
    """
    Builds a NetworkX undirected weighted graph, excluding blocked roads
    and applying traffic multipliers to travel_time.

    Args:
        blocked_roads: Optional list of road pairs to exclude (e.g. [['A', 'B']])
        traffic_conditions: Optional dict mapping road identifiers to congestion levels ('low', 'moderate', 'heavy') or multipliers.

    Returns:
        nx.Graph: Populated undirected weighted graph.
    """
    G = nx.Graph()

    # Add nodes with their visualization coordinates and human labels
    for node_id, data in NODES.items():
        G.add_node(
            node_id,
            id=node_id,
            label=data["label"],
            x=data["x"],
            y=data["y"]
        )

    # Compile set of blocked roads
    blocked_set = set()
    if blocked_roads:
        for road in blocked_roads:
            norm = normalize_road_key(road)
            if norm:
                blocked_set.add(norm)

    # Add edges with attributes
    for u, v, distance, base_time, name in ROADS:
        canonical = tuple(sorted([u, v]))
        if canonical in blocked_set:
            continue

        multiplier = get_traffic_multiplier_for_road(u, v, traffic_conditions)
        travel_time = round(base_time * multiplier, 2)

        G.add_edge(
            u,
            v,
            distance=float(distance),
            base_travel_time=float(base_time),
            travel_time=travel_time,
            traffic_multiplier=multiplier,
            name=name
        )

    return G


def get_network_data() -> Dict[str, Any]:
    """
    Returns complete static information about the road network including:
    - nodes: structured dictionary & list
    - roads: detailed list with endpoints, distance, travel time, and street names
    - stats: total nodes, total roads, total distance, average base travel time
    """
    total_roads = len(ROADS)
    total_distance = sum(r[2] for r in ROADS)
    total_base_time = sum(r[3] for r in ROADS)

    road_list = [
        {
            "from": r[0],
            "to": r[1],
            "distance": float(r[2]),
            "base_travel_time": float(r[3]),
            "travel_time": float(r[3]),
            "name": r[4],
            "id": f"{r[0]}-{r[1]}"
        }
        for r in ROADS
    ]

    node_list = [
        {
            "id": node_id,
            "label": data["label"],
            "x": data["x"],
            "y": data["y"]
        }
        for node_id, data in NODES.items()
    ]

    return {
        "nodes": NODES,
        "nodes_list": node_list,
        "roads": road_list,
        "stats": {
            "total_nodes": len(NODES),
            "total_roads": total_roads,
            "total_distance_km": total_distance,
            "avg_travel_time_min": round(total_base_time / total_roads, 2) if total_roads else 0.0,
            "traffic_multipliers": TRAFFIC_MULTIPLIERS,
        }
    }
