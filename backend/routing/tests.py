"""
Test suite for FlowShift routing engine and REST APIs.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .graph import (
    NODES,
    ROADS,
    TRAFFIC_MULTIPLIERS,
    build_graph,
    get_network_data,
    normalize_road_key,
    get_traffic_multiplier_for_road,
)
from .algorithms import (
    calculate_shortest_route,
    calculate_route_distance,
    calculate_route_travel_time,
    get_alternative_routes,
    get_node_connectivity,
)


class GraphEngineTests(APITestCase):
    """
    Unit tests for Graph construction and network data.
    """
    def test_network_data_structure(self):
        data = get_network_data()
        self.assertIn("nodes", data)
        self.assertIn("roads", data)
        self.assertIn("stats", data)
        self.assertEqual(len(data["nodes"]), 12)
        self.assertEqual(len(data["roads"]), 22)
        self.assertEqual(data["stats"]["total_nodes"], 12)
        self.assertEqual(data["stats"]["total_roads"], 22)

    def test_graph_builds_correctly(self):
        graph = build_graph()
        self.assertEqual(graph.number_of_nodes(), 12)
        self.assertEqual(graph.number_of_edges(), 22)

        # Check node attributes
        self.assertEqual(graph.nodes["A"]["label"], "Central Station")
        self.assertEqual(graph.nodes["A"]["x"], 150)
        self.assertEqual(graph.nodes["A"]["y"], 300)

        # Check edge attributes
        self.assertTrue(graph.has_edge("A", "B"))
        edge = graph["A"]["B"]
        self.assertEqual(edge["distance"], 4.0)
        self.assertEqual(edge["base_travel_time"], 8.0)
        self.assertEqual(edge["travel_time"], 8.0)
        self.assertEqual(edge["name"], "Main Street")

    def test_normalize_road_key(self):
        self.assertEqual(normalize_road_key(["a", "b"]), ("A", "B"))
        self.assertEqual(normalize_road_key(["b", "a"]), ("A", "B"))
        self.assertEqual(normalize_road_key("A-B"), ("A", "B"))
        self.assertEqual(normalize_road_key("b_a"), ("A", "B"))
        self.assertEqual(normalize_road_key("A, B"), ("A", "B"))

    def test_traffic_multiplier(self):
        traffic = {"A-B": "heavy", "B-D": "moderate", "D-F": 1.8}
        self.assertEqual(get_traffic_multiplier_for_road("A", "B", traffic), 2.5)
        self.assertEqual(get_traffic_multiplier_for_road("B", "A", traffic), 2.5)
        self.assertEqual(get_traffic_multiplier_for_road("B", "D", traffic), 1.5)
        self.assertEqual(get_traffic_multiplier_for_road("D", "F", traffic), 1.8)
        self.assertEqual(get_traffic_multiplier_for_road("C", "E", traffic), 1.0)

    def test_graph_with_traffic_and_blockages(self):
        blocked = [["A", "B"]]
        traffic = {"A-C": "heavy"}
        graph = build_graph(blocked_roads=blocked, traffic_conditions=traffic)

        # A-B must not exist
        self.assertFalse(graph.has_edge("A", "B"))
        self.assertEqual(graph.number_of_edges(), 21)

        # A-C must have heavy traffic multiplier (base 12 * 2.5 = 30.0)
        self.assertTrue(graph.has_edge("A", "C"))
        self.assertEqual(graph["A"]["C"]["travel_time"], 30.0)
        self.assertEqual(graph["A"]["C"]["traffic_multiplier"], 2.5)


class AlgorithmTests(APITestCase):
    """
    Unit tests for routing algorithms: shortest path, alternatives, connectivity.
    """
    def test_shortest_path_a_to_j_distance(self):
        result = calculate_shortest_route("A", "J", optimization="distance")
        self.assertTrue(result["success"])
        path = result["path"]
        self.assertEqual(path[0], "A")
        self.assertEqual(path[-1], "J")
        self.assertGreater(result["distance"], 0)
        self.assertGreater(result["travel_time"], 0)
        self.assertGreater(len(result["segments"]), 0)

        # Verify segments match distance sum
        segment_dist_sum = sum(s["distance"] for s in result["segments"])
        self.assertEqual(round(segment_dist_sum, 2), result["distance"])

    def test_shortest_path_a_to_j_time(self):
        result = calculate_shortest_route("A", "J", optimization="time")
        self.assertTrue(result["success"])
        self.assertEqual(result["path"][0], "A")
        self.assertEqual(result["path"][-1], "J")

    def test_blocked_road_changes_path(self):
        # Initial route A -> D
        initial_route = calculate_shortest_route("A", "D", optimization="distance")
        self.assertTrue(initial_route["success"])
        initial_path = initial_route["path"]

        # Block the first hop or second hop in the initial path
        blocked_edge = [initial_path[0], initial_path[1]]
        detour_route = calculate_shortest_route(
            "A", "D",
            blocked_roads=[blocked_edge],
            optimization="distance"
        )

        self.assertTrue(detour_route["success"])
        detour_path = detour_route["path"]
        self.assertNotEqual(initial_path, detour_path)
        # Verify the blocked edge is not in the detour
        for i in range(len(detour_path) - 1):
            pair = tuple(sorted([detour_path[i], detour_path[i + 1]]))
            self.assertNotEqual(pair, tuple(sorted(blocked_edge)))

    def test_no_route_scenario_returns_error(self):
        # Isolate node J: J connects to H ("H-J") and I ("I-J")
        isolated_blocks = [["H", "J"], ["I", "J"]]
        result = calculate_shortest_route("A", "J", blocked_roads=isolated_blocks)
        self.assertFalse(result["success"])
        self.assertEqual(result["error_type"], "NoPath")
        self.assertIn("No available route", result["error"])

    def test_same_source_and_destination(self):
        result = calculate_shortest_route("A", "A")
        self.assertTrue(result["success"])
        self.assertEqual(result["path"], ["A"])
        self.assertEqual(result["distance"], 0.0)
        self.assertEqual(result["travel_time"], 0.0)
        self.assertEqual(result["segments"], [])

    def test_invalid_nodes(self):
        res1 = calculate_shortest_route("INVALID", "A")
        self.assertFalse(res1["success"])
        self.assertEqual(res1["error_type"], "NodeNotFound")

        res2 = calculate_shortest_route("A", "NON_EXISTENT")
        self.assertFalse(res2["success"])
        self.assertEqual(res2["error_type"], "NodeNotFound")

    def test_alternative_routes(self):
        alternatives = get_alternative_routes("A", "J", optimization="distance")
        self.assertIsInstance(alternatives, list)
        self.assertLessEqual(len(alternatives), 2)
        for alt in alternatives:
            self.assertTrue(alt["success"])
            self.assertEqual(alt["path"][0], "A")
            self.assertEqual(alt["path"][-1], "J")
            self.assertIn("bypassed_road", alt)

    def test_node_connectivity(self):
        conn = get_node_connectivity("A")
        self.assertTrue(conn["success"])
        self.assertEqual(conn["node_id"], "A")
        self.assertEqual(conn["label"], "Central Station")
        self.assertIn("B", conn["connected_nodes"])
        self.assertIn("C", conn["connected_nodes"])
        self.assertIn("L", conn["connected_nodes"])

        # With blocked road A-B
        conn_blocked = get_node_connectivity("A", blocked_roads=[["A", "B"]])
        self.assertNotIn("B", conn_blocked["connected_nodes"])

    def test_node_connectivity_invalid(self):
        conn = get_node_connectivity("UNKNOWN")
        self.assertFalse(conn["success"])
        self.assertEqual(conn["error_type"], "NodeNotFound")


class APIRoutingViewsTests(APITestCase):
    """
    End-to-end API integration tests.
    """
    def test_get_network_endpoint(self):
        response = self.client.get('/api/network/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("nodes", response.data)
        self.assertIn("roads", response.data)
        self.assertIn("stats", response.data)
        self.assertEqual(response.data["stats"]["total_nodes"], 12)

    def test_get_node_connectivity_endpoint(self):
        response = self.client.get('/api/network/node/B/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["node_id"], "B")
        self.assertEqual(response.data["label"], "Market Square")

    def test_get_node_connectivity_not_found(self):
        response = self.client.get('/api/network/node/XYZ/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data["success"])

    def test_post_route_endpoint_success(self):
        payload = {
            "source": "A",
            "destination": "H",
            "blocked_roads": [["B", "D"]],
            "optimization": "distance",
            "traffic_conditions": {"E-F": "heavy"}
        }
        response = self.client.post('/api/route/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["source"], "A")
        self.assertEqual(response.data["destination"], "H")
        self.assertIn("path", response.data)
        self.assertIn("distance", response.data)
        self.assertIn("travel_time", response.data)
        self.assertIn("segments", response.data)
        self.assertIn("alternatives", response.data)

    def test_post_route_invalid_payload(self):
        payload = {"source": "NON_EXISTENT", "destination": "H"}
        response = self.client.post('/api/route/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    def test_post_route_no_path(self):
        payload = {
            "source": "A",
            "destination": "J",
            "blocked_roads": [["H", "J"], ["I", "J"]]
        }
        response = self.client.post('/api/route/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data["success"])

    def test_post_route_alternatives_endpoint(self):
        payload = {
            "source": "A",
            "destination": "H",
            "blocked_roads": [],
            "optimization": "distance"
        }
        response = self.client.post('/api/route/alternatives/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("alternatives", response.data)

    def test_post_simulate_traffic_endpoint(self):
        payload = {
            "traffic_conditions": {
                "A-B": "heavy",
                "B-D": "moderate"
            },
            "source": "A",
            "destination": "J",
            "optimization": "time"
        }
        response = self.client.post('/api/simulate/traffic/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("updated_roads", response.data)
        self.assertIn("recommended_route", response.data)

        # Check that A-B travel time was updated with 2.5 multiplier
        ab_road = next(r for r in response.data["updated_roads"] if r["id"] in ["A-B", "B-A"])
        self.assertEqual(ab_road["traffic_multiplier"], 2.5)
        self.assertEqual(ab_road["travel_time"], 20.0)
