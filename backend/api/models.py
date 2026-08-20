"""
Database Models for ResqNet Crisis Response Ecosystem.

Fully compatible with PostgreSQL and SQLite.
Entities:
1. UserProfile: System users (Citizens, Volunteers, Authorities) with GPS location & volunteer metadata.
2. Incident: Emergency crisis reports (Floods, Fires, Medical Emergencies, etc.) with severity levels & coordinates.
3. Resource: Available community supplies (Food, Water, Medical, Shelter) with live stock statuses.
4. Alert: Geo-fenced 5km alert notifications generated for nearby emergency events.
5. ChatMessage: Real-time community & incident-specific broadcast channel messages.
6. VolunteerEvaluation: Official performance ratings & comments logged by Authority officers.
"""

from django.db import models
from django.utils import timezone


# -----------------------------------------------------------------------------
# 1. USER PROFILE MODEL
# -----------------------------------------------------------------------------
class UserProfile(models.Model):
    """
    Stores user information, role profiles (Citizen, Volunteer, Authority),
    volunteer organization affiliations, performance ratings, and GPS location.
    """
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('volunteer', 'Volunteer'),
        ('authority', 'Authority'),
    ]

    VOLUNTEER_TYPE_CHOICES = [
        ('Local Resident', 'Local Resident'),
        ('NGO Member', 'NGO Member'),
        ('Social Worker', 'Social Worker'),
        ('Govt. Official', 'Govt. Official'),
    ]

    # Unique string identifier matching frontend mock IDs ('u1', 'v1', 'a1', etc.)
    user_id = models.CharField(max_length=64, primary_key=True, help_text="Unique user identifier")
    name = models.CharField(max_length=150, help_text="Full display name")
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='citizen', help_text="User role profile")
    
    # Volunteer specific fields
    volunteer_type = models.CharField(max_length=50, choices=VOLUNTEER_TYPE_CHOICES, blank=True, null=True, help_text="Category of responder")
    organization = models.CharField(max_length=200, blank=True, null=True, help_text="Associated NGO or government entity")
    bio = models.TextField(blank=True, null=True, help_text="Responder bio and certified skills")
    rating = models.FloatField(default=5.0, help_text="Volunteer performance rating (1.0 to 5.0)")
    total_works = models.IntegerField(default=0, help_text="Total completed emergency responses")

    # Location coordinates (Latitude & Longitude)
    latitude = models.FloatField(default=34.0522, help_text="Current GPS latitude")
    longitude = models.FloatField(default=-118.2437, help_text="Current GPS longitude")
    preferred_language = models.CharField(max_length=30, default='English', help_text="User preferred language")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-rating', 'name']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"


# -----------------------------------------------------------------------------
# 2. INCIDENT MODEL
# -----------------------------------------------------------------------------
class Incident(models.Model):
    """
    Represents an emergency crisis reported by a citizen or authority.
    Contains category, severity, status tracking, and precise spatial coordinates.
    """
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('sos', 'SOS'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]

    incident_id = models.CharField(max_length=64, primary_key=True, help_text="Unique incident ID")
    incident_type = models.CharField(max_length=100, help_text="Type of crisis (e.g. Fire, Flood, Medical Emergency)")
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium', help_text="Urgency level")
    description = models.TextField(help_text="Detailed situational description")
    
    # Location coordinates
    latitude = models.FloatField(help_text="Incident GPS latitude")
    longitude = models.FloatField(help_text="Incident GPS longitude")

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', help_text="Current incident status")
    reported_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reported_incidents', help_text="User who logged the report")
    created_at = models.DateTimeField(default=timezone.now, help_text="Timestamp when crisis was logged")
    response_time = models.IntegerField(blank=True, null=True, help_text="Response time in minutes")

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Incident'
        verbose_name_plural = 'Incidents'

    def __str__(self):
        return f"[{self.severity.upper()}] {self.incident_type} - {self.status}"


# -----------------------------------------------------------------------------
# 3. RESOURCE MODEL
# -----------------------------------------------------------------------------
class Resource(models.Model):
    """
    Represents community inventory supplies (Food, Water, Medical, Shelter).
    Tracked by volunteers and citizens with stock levels and spatial coordinates.
    """
    RESOURCE_TYPE_CHOICES = [
        ('food', 'Food'),
        ('water', 'Water'),
        ('medical', 'Medical'),
        ('shelter', 'Shelter'),
    ]

    STATUS_CHOICES = [
        ('available', 'Available'),
        ('low', 'Low Stock'),
        ('unavailable', 'Unavailable'),
    ]

    resource_id = models.CharField(max_length=64, primary_key=True, help_text="Unique resource ID")
    resource_type = models.CharField(max_length=30, choices=RESOURCE_TYPE_CHOICES, help_text="Supply type")
    quantity = models.IntegerField(default=0, help_text="Available stock quantity")
    
    latitude = models.FloatField(help_text="Distribution point latitude")
    longitude = models.FloatField(help_text="Distribution point longitude")

    updated_by = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='managed_resources', help_text="User who updated this stock")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', help_text="Inventory availability status")
    updated_at = models.DateTimeField(default=timezone.now, help_text="Last inventory sync timestamp")

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Resource'
        verbose_name_plural = 'Resources'

    def __str__(self):
        return f"{self.get_resource_type_display()} ({self.quantity} units) - {self.status}"


# -----------------------------------------------------------------------------
# 4. ALERT MODEL
# -----------------------------------------------------------------------------
class Alert(models.Model):
    """
    Geo-fenced emergency alert notification issued to nearby citizens.
    """
    alert_id = models.CharField(max_length=64, primary_key=True, help_text="Unique alert ID")
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, related_name='alerts', help_text="Triggering incident")
    alert_type = models.CharField(max_length=100, default='Nearby Crisis', help_text="Alert category")
    message = models.TextField(help_text="Broadcast notification message")
    radius_km = models.FloatField(default=5.0, help_text="Geo-fence alert radius in kilometers")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Emergency Alert'
        verbose_name_plural = 'Emergency Alerts'

    def __str__(self):
        return f"Alert for Incident {self.incident_id}: {self.message[:50]}"


# -----------------------------------------------------------------------------
# 5. CHAT MESSAGE MODEL
# -----------------------------------------------------------------------------
class ChatMessage(models.Model):
    """
    Real-time community broadcast chat messages and AI Counselor conversations.
    """
    message_id = models.CharField(max_length=64, primary_key=True, help_text="Unique message ID")
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='messages', help_text="Sender user")
    user_name = models.CharField(max_length=150, help_text="Sender display name")
    role = models.CharField(max_length=30, help_text="Sender role")
    text = models.TextField(help_text="Message text content")
    timestamp = models.DateTimeField(default=timezone.now)
    language = models.CharField(max_length=30, default='English', help_text="Language of message")
    channel_id = models.CharField(max_length=64, default='general', help_text="Channel ID ('general', incident ID, or 'ai-assistant')")

    class Meta:
        ordering = ['timestamp']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'

    def __str__(self):
        return f"[{self.channel_id}] {self.user_name}: {self.text[:30]}"


# -----------------------------------------------------------------------------
# 6. VOLUNTEER EVALUATION MODEL
# -----------------------------------------------------------------------------
class VolunteerEvaluation(models.Model):
    """
    Official volunteer performance evaluations logged by Authority commanders.
    """
    evaluation_id = models.CharField(max_length=64, primary_key=True, help_text="Unique evaluation ID")
    volunteer = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='evaluations_received', help_text="Evaluated volunteer")
    authority = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='evaluations_given', help_text="Authoritative officer")
    rating = models.FloatField(help_text="Rating score out of 5.0")
    comment = models.TextField(help_text="Official performance assessment comments")
    timestamp = models.DateTimeField(default=timezone.now)
    linked_work_id = models.CharField(max_length=64, blank=True, null=True, help_text="Optional linked incident or resource ID")

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Volunteer Evaluation'
        verbose_name_plural = 'Volunteer Evaluations'

    def __str__(self):
        return f"Evaluation for {self.volunteer.name}: {self.rating}/5.0"
