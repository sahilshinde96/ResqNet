"""
Django REST Framework Serializers for ResqNet Crisis Platform.

Serializers convert Django Model instances to/from JSON representations
to serve HTTP endpoints consumed by the React TypeScript frontend.
"""

from rest_framework import serializers
from .models import UserProfile, Incident, Resource, Alert, ChatMessage, VolunteerEvaluation


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializes user profile data, including role, ratings, coordinates, and responder metadata.
    """
    id = serializers.CharField(source='user_id', read_only=True)
    preferredLanguage = serializers.CharField(source='preferred_language', required=False, allow_blank=True)
    volunteerType = serializers.CharField(source='volunteer_type', required=False, allow_null=True, allow_blank=True)
    totalWorks = serializers.IntegerField(source='total_works', read_only=True)

    location = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_id', 'name', 'role', 'volunteerType', 'organization',
            'bio', 'rating', 'totalWorks', 'location', 'latitude', 'longitude',
            'preferredLanguage'
        ]

    def get_location(self, obj):
        """Format latitude/longitude as a JSON location object for React compatibility."""
        return {'lat': obj.latitude, 'lng': obj.longitude}


class IncidentSerializer(serializers.ModelSerializer):
    """
    Serializes crisis incidents for live map markers and emergency response cards.
    """
    id = serializers.CharField(source='incident_id', read_only=True)
    type = serializers.CharField(source='incident_type')
    reportedBy = serializers.CharField(source='reported_by.user_id', read_only=True)
    reportedById = serializers.CharField(source='reported_by_id', write_only=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    responseTime = serializers.IntegerField(source='response_time', required=False, allow_null=True)

    class Meta:
        model = Incident
        fields = [
            'id', 'incident_id', 'type', 'severity', 'description',
            'latitude', 'longitude', 'status', 'reportedBy', 'reportedById',
            'createdAt', 'responseTime'
        ]

    def create(self, validated_data):
        """Custom create to assign reported_by UserProfile instance if passed."""
        reported_by_id = validated_data.pop('reported_by_id', 'u1')
        user_profile = UserProfile.objects.filter(user_id=reported_by_id).first()
        if not user_profile:
            user_profile = UserProfile.objects.first()
        
        # Auto-generate incident_id if not present
        if 'incident_id' not in validated_data:
            import time
            validated_data['incident_id'] = f"i-{int(time.time() * 1000)}"

        validated_data['reported_by'] = user_profile
        return super().create(validated_data)


class ResourceSerializer(serializers.ModelSerializer):
    """
    Serializes emergency supply inventories (Food, Water, Medical, Shelter).
    """
    id = serializers.CharField(source='resource_id', read_only=True)
    type = serializers.CharField(source='resource_type')
    updatedBy = serializers.CharField(source='updated_by.user_id', read_only=True)
    updatedById = serializers.CharField(source='updated_by_id', write_only=True, required=False)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 'resource_id', 'type', 'quantity', 'latitude', 'longitude',
            'updatedBy', 'updatedById', 'status', 'updatedAt'
        ]

    def create(self, validated_data):
        """Custom create to assign updated_by UserProfile instance."""
        updated_by_id = validated_data.pop('updated_by_id', 'v1')
        user_profile = UserProfile.objects.filter(user_id=updated_by_id).first()
        if not user_profile:
            user_profile = UserProfile.objects.first()

        if 'resource_id' not in validated_data:
            import time
            validated_data['resource_id'] = f"r-{int(time.time() * 1000)}"

        validated_data['updated_by'] = user_profile
        return super().create(validated_data)


class AlertSerializer(serializers.ModelSerializer):
    """
    Serializes 5km radius emergency alert notifications.
    """
    id = serializers.CharField(source='alert_id', read_only=True)
    incidentId = serializers.CharField(source='incident.incident_id', read_only=True)
    type = serializers.CharField(source='alert_type')
    radiusKm = serializers.FloatField(source='radius_km')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Alert
        fields = ['id', 'alert_id', 'incidentId', 'type', 'message', 'radiusKm', 'createdAt']


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializes community broadcast and AI counselor chat messages.
    """
    id = serializers.CharField(source='message_id', read_only=True)
    userId = serializers.CharField(source='user.user_id', read_only=True)
    userIdInput = serializers.CharField(source='user_id_input', write_only=True, required=False)
    userName = serializers.CharField(source='user_name')
    channelId = serializers.CharField(source='channel_id')

    class Meta:
        model = ChatMessage
        fields = ['id', 'message_id', 'userId', 'userIdInput', 'userName', 'role', 'text', 'timestamp', 'language', 'channelId']

    def create(self, validated_data):
        """Ensure message maps to a valid UserProfile."""
        user_id = validated_data.pop('user_id_input', 'u1')
        user_profile = UserProfile.objects.filter(user_id=user_id).first()
        if not user_profile:
            user_profile = UserProfile.objects.first()

        if 'message_id' not in validated_data:
            import time
            validated_data['message_id'] = f"m-{int(time.time() * 1000)}"

        validated_data['user'] = user_profile
        return super().create(validated_data)


class VolunteerEvaluationSerializer(serializers.ModelSerializer):
    """
    Serializes official volunteer ratings submitted by Authorities.
    """
    id = serializers.CharField(source='evaluation_id', read_only=True)
    volunteerId = serializers.CharField(source='volunteer.user_id')
    authorityId = serializers.CharField(source='authority.user_id')
    linkedWorkId = serializers.CharField(source='linked_work_id', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = VolunteerEvaluation
        fields = ['id', 'evaluation_id', 'volunteerId', 'authorityId', 'rating', 'comment', 'timestamp', 'linkedWorkId']

    def create(self, validated_data):
        volunteer_data = validated_data.pop('volunteer')
        authority_data = validated_data.pop('authority')

        volunteer = UserProfile.objects.filter(user_id=volunteer_data['user_id']).first()
        authority = UserProfile.objects.filter(user_id=authority_data['user_id']).first()

        if 'evaluation_id' not in validated_data:
            import time
            validated_data['evaluation_id'] = f"e-{int(time.time() * 1000)}"

        validated_data['volunteer'] = volunteer
        validated_data['authority'] = authority
        return super().create(validated_data)
