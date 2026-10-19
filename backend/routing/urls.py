"""
URL routing patterns for the routing application.
"""
from django.urls import path
from .views import (
    NetworkDataView,
    NodeConnectivityView,
    CalculateRouteView,
    AlternativeRoutesView,
    SimulateTrafficView,
)

urlpatterns = [
    path('network/', NetworkDataView.as_view(), name='network-data'),
    path('network/node/<str:node_id>/', NodeConnectivityView.as_view(), name='node-connectivity'),
    path('route/', CalculateRouteView.as_view(), name='calculate-route'),
    path('route/alternatives/', AlternativeRoutesView.as_view(), name='alternative-routes'),
    path('simulate/traffic/', SimulateTrafficView.as_view(), name='simulate-traffic'),
]
