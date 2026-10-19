"""
REST API Views for FlowShift Urban Route Optimization.

Provides endpoints for:
- GET /api/network/ : Network topology, nodes, roads, and statistics
- GET /api/network/node/<node_id>/ : Connectivity and edge metrics for a specific node
- POST /api/route/ : Shortest route calculation with alternative route exploration
- POST /api/route/alternatives/ : Dedicated alternative routes calculation
- POST /api/simulate/traffic/ : Dynamic traffic simulation and recalculation of road times
"""
import json
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .graph import (
    ROADS,
    get_network_data,
    get_traffic_multiplier_for_road,
)
from .algorithms import (
    calculate_shortest_route,
    get_alternative_routes,
    get_node_connectivity,
)
from .serializers import (
    RouteRequestSerializer,
    TrafficSimulationSerializer,
)


class NetworkDataView(APIView):
    """
    Returns complete static information about the road network:
    all nodes (with coordinates), all roads, and summary statistics.
    """
    def get(self, request):
        network_data = get_network_data()
        return Response(network_data, status=status.HTTP_200_OK)


class NodeConnectivityView(APIView):
    """
    Returns connectivity info and connected road details for a specific node.
    Optional query parameter: 'blocked_roads' (JSON list of pairs, e.g. [["A","B"]])
    """
    def get(self, request, node_id: str):
        blocked_roads = []
        blocked_param = request.query_params.get("blocked_roads")
        if blocked_param:
            try:
                blocked_roads = json.loads(blocked_param)
            except Exception:
                blocked_roads = []

        result = get_node_connectivity(node_id, blocked_roads=blocked_roads)
        if not result.get("success"):
            return Response(result, status=status.HTTP_404_NOT_FOUND)

        return Response(result, status=status.HTTP_200_OK)


class CalculateRouteView(APIView):
    """
    Calculates the optimal route and up to 2 alternative routes based on:
    - source node
    - destination node
    - blocked roads
    - optimization objective ('distance' or 'time')
    - dynamic traffic conditions
    """
    def post(self, request):
        serializer = RouteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        source = data["source"]
        destination = data["destination"]
        blocked_roads = data.get("blocked_roads", [])
        optimization = data.get("optimization", "distance")
        traffic_conditions = data.get("traffic_conditions", {})

        # Compute optimal primary route
        primary_route = calculate_shortest_route(
            source=source,
            destination=destination,
            blocked_roads=blocked_roads,
            optimization=optimization,
            traffic_conditions=traffic_conditions
        )

        if not primary_route.get("success"):
            error_status = (
                status.HTTP_404_NOT_FOUND
                if primary_route.get("error_type") == "NoPath"
                else status.HTTP_400_BAD_REQUEST
            )
            return Response(primary_route, status=error_status)

        # Compute alternative routes bypassing primary route edges
        primary_path = primary_route.get("path", [])
        alternatives = get_alternative_routes(
            source=source,
            destination=destination,
            blocked_roads=blocked_roads,
            primary_path=primary_path,
            optimization=optimization,
            traffic_conditions=traffic_conditions
        )

        response_data = dict(primary_route)
        response_data["alternatives"] = alternatives

        return Response(response_data, status=status.HTTP_200_OK)


class AlternativeRoutesView(APIView):
    """
    Calculates and returns alternative routes bypassing edges of the primary route.
    """
    def post(self, request):
        serializer = RouteRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        source = data["source"]
        destination = data["destination"]
        blocked_roads = data.get("blocked_roads", [])
        optimization = data.get("optimization", "distance")
        traffic_conditions = data.get("traffic_conditions", {})

        primary_route = calculate_shortest_route(
            source=source,
            destination=destination,
            blocked_roads=blocked_roads,
            optimization=optimization,
            traffic_conditions=traffic_conditions
        )

        if not primary_route.get("success"):
            error_status = (
                status.HTTP_404_NOT_FOUND
                if primary_route.get("error_type") == "NoPath"
                else status.HTTP_400_BAD_REQUEST
            )
            return Response(primary_route, status=error_status)

        alternatives = get_alternative_routes(
            source=source,
            destination=destination,
            blocked_roads=blocked_roads,
            primary_path=primary_route.get("path", []),
            optimization=optimization,
            traffic_conditions=traffic_conditions
        )

        return Response(
            {
                "success": True,
                "source": source,
                "destination": destination,
                "optimization": optimization,
                "primary_path": primary_route.get("path", []),
                "alternatives": alternatives
            },
            status=status.HTTP_200_OK
        )


class SimulateTrafficView(APIView):
    """
    Simulates dynamic traffic across the network and returns updated travel times
    for all roads, along with a newly recommended optimal route.
    """
    def post(self, request):
        serializer = TrafficSimulationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"success": False, "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = serializer.validated_data
        traffic_conditions = data["traffic_conditions"]
        source = data.get("source", "A")
        destination = data.get("destination", "J")
        optimization = data.get("optimization", "time")
        blocked_roads = data.get("blocked_roads", [])

        # Recalculate road metrics under simulated traffic conditions
        updated_roads = []
        for u, v, dist, base_time, name in ROADS:
            multiplier = get_traffic_multiplier_for_road(u, v, traffic_conditions)
            updated_time = round(base_time * multiplier, 2)
            updated_roads.append({
                "from": u,
                "to": v,
                "id": f"{u}-{v}",
                "name": name,
                "distance": float(dist),
                "base_travel_time": float(base_time),
                "travel_time": updated_time,
                "traffic_multiplier": multiplier,
                "is_congested": multiplier > 1.0,
            })

        # Calculate recommended route under updated traffic
        recommended_route = calculate_shortest_route(
            source=source,
            destination=destination,
            blocked_roads=blocked_roads,
            optimization=optimization,
            traffic_conditions=traffic_conditions
        )

        alternatives = []
        if recommended_route.get("success"):
            alternatives = get_alternative_routes(
                source=source,
                destination=destination,
                blocked_roads=blocked_roads,
                primary_path=recommended_route.get("path", []),
                optimization=optimization,
                traffic_conditions=traffic_conditions
            )

        return Response(
            {
                "success": True,
                "traffic_conditions": traffic_conditions,
                "updated_roads": updated_roads,
                "recommended_route": recommended_route,
                "alternatives": alternatives
            },
            status=status.HTTP_200_OK
        )
