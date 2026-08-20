"""
URL Routing for ResqNet REST API Endpoints.

Routes registered:
- GET/POST /api/users/           : Manage User Profiles
- GET/POST /api/incidents/       : Log & Triage Crisis Incidents
- GET/POST /api/resources/       : Manage Community Resource Inventories
- GET/POST /api/alerts/          : Fetch Emergency 5km Alerts
- GET/POST /api/messages/        : Broadcast & AI Community Chat Messages
- GET/POST /api/evaluations/     : Authority Volunteer Performance Ratings
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserProfileViewSet, IncidentViewSet, ResourceViewSet,
    AlertViewSet, ChatMessageViewSet, VolunteerEvaluationViewSet
)

# Initialize DRF DefaultRouter for RESTful resource mapping
router = DefaultRouter()
router.register(r'users', UserProfileViewSet, basename='userprofile')
router.register(r'incidents', IncidentViewSet, basename='incident')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'messages', ChatMessageViewSet, basename='chatmessage')
router.register(r'evaluations', VolunteerEvaluationViewSet, basename='volunteerevaluation')

urlpatterns = [
    # Include all auto-generated REST routes under /api/
    path('', include(router.urls)),
]
