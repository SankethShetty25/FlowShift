"""
Serializers for FlowShift API requests and responses.
"""
from rest_framework import serializers
from .graph import NODES


class RouteRequestSerializer(serializers.Serializer):
    """
    Serializer for route calculation and alternative routes requests.
    """
    source = serializers.CharField(
        max_length=10,
        required=True,
        help_text="Origin node identifier (e.g., 'A')"
    )
    destination = serializers.CharField(
        max_length=10,
        required=True,
        help_text="Target destination node identifier (e.g., 'H')"
    )
    blocked_roads = serializers.ListField(
        required=False,
        default=list,
        help_text="List of blocked road pairs (e.g., [['B', 'D']])"
    )
    optimization = serializers.ChoiceField(
        choices=["distance", "time", "travel_time"],
        default="distance",
        required=False,
        help_text="Routing optimization objective: 'distance' or 'time'"
    )
    traffic_conditions = serializers.DictField(
        required=False,
        default=dict,
        help_text="Dictionary of road traffic congestion levels (e.g., {'A-B': 'heavy'})"
    )

    def validate_source(self, value):
        cleaned = value.strip().upper()
        if cleaned not in NODES:
            raise serializers.ValidationError(f"Invalid source node '{value}'. Available nodes: {list(NODES.keys())}")
        return cleaned

    def validate_destination(self, value):
        cleaned = value.strip().upper()
        if cleaned not in NODES:
            raise serializers.ValidationError(f"Invalid destination node '{value}'. Available nodes: {list(NODES.keys())}")
        return cleaned


class TrafficSimulationSerializer(serializers.Serializer):
    """
    Serializer for traffic simulation requests.
    """
    traffic_conditions = serializers.DictField(
        required=True,
        help_text="Road traffic mapping (e.g., {'A-B': 'heavy', 'B-D': 'moderate'})"
    )
    source = serializers.CharField(
        max_length=10,
        required=False,
        default="A",
        help_text="Optional origin node to test recommended route"
    )
    destination = serializers.CharField(
        max_length=10,
        required=False,
        default="J",
        help_text="Optional destination node to test recommended route"
    )
    optimization = serializers.ChoiceField(
        choices=["distance", "time", "travel_time"],
        default="time",
        required=False,
        help_text="Optimization goal for recommended route"
    )
    blocked_roads = serializers.ListField(
        required=False,
        default=list,
        help_text="List of blocked road pairs"
    )

    def validate_source(self, value):
        if value:
            cleaned = value.strip().upper()
            if cleaned not in NODES:
                raise serializers.ValidationError(f"Invalid source node '{value}'. Available nodes: {list(NODES.keys())}")
            return cleaned
        return "A"

    def validate_destination(self, value):
        if value:
            cleaned = value.strip().upper()
            if cleaned not in NODES:
                raise serializers.ValidationError(f"Invalid destination node '{value}'. Available nodes: {list(NODES.keys())}")
            return cleaned
        return "J"
