"""
URL configuration for FlowShift project.
"""
from django.urls import path, include

urlpatterns = [
    path('api/', include('routing.urls')),
]
