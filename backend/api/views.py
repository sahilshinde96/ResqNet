"""
Django REST Framework Views for ResqNet Crisis Intelligence Platform.

Provides CRUD REST endpoints for:
- Incidents: Log emergency reports, update crisis statuses (PENDING -> IN_PROGRESS -> RESOLVED).
- Resources: Track community food, water, medical, and shelter inventories.
- User Profiles: Manage Citizens, Volunteers, and Authority Officers.
- Alerts: Filter and list active 5km emergency notifications.
- Chat Messages: Community broadcast and Crisis AI Counselor messaging streams.
- Volunteer Evaluations: Authority performance evaluations.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone

from .models import UserProfile, Incident, Resource, Alert, ChatMessage, VolunteerEvaluation
from .serializers import (
    UserProfileSerializer, IncidentSerializer, ResourceSerializer,
    AlertSerializer, ChatMessageSerializer, VolunteerEvaluationSerializer
)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing User Profiles (Citizens, Volunteers, Authorities).
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        role = self.request.query_params.get('role')
        if role:
            return UserProfile.objects.filter(role=role)
        return super().get_queryset()


class IncidentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for logging and managing emergency incidents.
    Supports filtering by status (pending, in-progress, resolved) and severity.
    """
    queryset = Incident.objects.all()
    serializer_class = IncidentSerializer

    def get_queryset(self):
        queryset = Incident.objects.all()
        status_param = self.request.query_params.get('status')
        severity_param = self.request.query_params.get('severity')

        if status_param:
            queryset = queryset.filter(status=status_param)
        if severity_param:
            queryset = queryset.filter(severity=severity_param)
            
        return queryset

    def perform_create(self, serializer):
        """Auto-generate emergency alerts for HIGH or SOS severity incidents."""
        incident = serializer.save()
        if incident.severity in ['high', 'sos']:
            Alert.objects.create(
                alert_id=f"a-{incident.incident_id}",
                incident=incident,
                alert_type='Nearby Crisis',
                message=f"EMERGENCY: {incident.incident_type} reported within 5km.",
                radius_km=5.0
            )


class ResourceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for registering and updating community emergency inventory stock levels.
    """
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer

    def get_queryset(self):
        queryset = Resource.objects.all()
        type_param = self.request.query_params.get('type')
        status_param = self.request.query_params.get('status')

        if type_param and type_param != 'all':
            queryset = queryset.filter(resource_type=type_param)
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset


class AlertViewSet(viewsets.ModelViewSet):
    """
    API endpoint for retrieving active 5km emergency notifications.
    """
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for posting and reading community broadcast & AI Counselor chat messages.
    """
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        queryset = ChatMessage.objects.all()
        channel_id = self.request.query_params.get('channelId')
        if channel_id:
            queryset = queryset.filter(channel_id=channel_id)
        return queryset


class VolunteerEvaluationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for authority commanders to evaluate and rate volunteer performance.
    """
    queryset = VolunteerEvaluation.objects.all()
    serializer_class = VolunteerEvaluationSerializer
