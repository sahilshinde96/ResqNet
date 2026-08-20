"""
Django Admin Registration for ResqNet Models.
Provides web-based admin management for all crisis models.
"""

from django.contrib import admin
from .models import UserProfile, Incident, Resource, Alert, ChatMessage, VolunteerEvaluation


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'name', 'role', 'volunteer_type', 'rating', 'total_works')
    list_filter = ('role', 'volunteer_type')
    search_fields = ('name', 'user_id', 'organization')


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('incident_id', 'incident_type', 'severity', 'status', 'reported_by', 'created_at')
    list_filter = ('severity', 'status', 'incident_type')
    search_fields = ('incident_type', 'description', 'incident_id')


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('resource_id', 'resource_type', 'quantity', 'status', 'updated_by', 'updated_at')
    list_filter = ('resource_type', 'status')
    search_fields = ('resource_type', 'resource_id')


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('alert_id', 'incident', 'alert_type', 'radius_km', 'created_at')
    search_fields = ('message', 'alert_id')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'user_name', 'role', 'channel_id', 'timestamp')
    list_filter = ('channel_id', 'role', 'language')
    search_fields = ('text', 'user_name')


@admin.register(VolunteerEvaluation)
class VolunteerEvaluationAdmin(admin.ModelAdmin):
    list_display = ('evaluation_id', 'volunteer', 'authority', 'rating', 'timestamp')
    search_fields = ('comment', 'volunteer__name', 'authority__name')
