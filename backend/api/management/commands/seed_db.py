"""
Custom Django Management Command: seed_db

Usage:
    python backend/manage.py seed_db

Populates the database with default mock users, crisis incidents, resources,
chat messages, and emergency alerts for demonstration and testing.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import UserProfile, Incident, Resource, Alert, ChatMessage


class Command(BaseCommand):
    help = 'Seeds the database with initial ResqNet crisis data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting ResqNet database seeding...'))

        # 1. Seed Users (Mumbai Locations)
        users_data = [
            {'user_id': 'u1', 'name': 'Alex Johnson', 'role': 'citizen', 'latitude': 19.0760, 'longitude': 72.8777, 'preferred_language': 'English'},
            {'user_id': 'a1', 'name': 'Chief Miller', 'role': 'authority', 'latitude': 19.0760, 'longitude': 72.8777, 'preferred_language': 'English'},
            {'user_id': 'v1', 'name': 'Sarah Chen', 'role': 'volunteer', 'volunteer_type': 'NGO Member', 'organization': 'Hope Foundation Mumbai', 'bio': 'Certified First Aid Responder', 'rating': 4.8, 'total_works': 12},
            {'user_id': 'v2', 'name': 'Marcus Thorne', 'role': 'volunteer', 'volunteer_type': 'Local Resident', 'organization': 'Bandra West Watch', 'bio': 'Local evacuation route guide', 'rating': 4.2, 'total_works': 8},
            {'user_id': 'v3', 'name': 'Elena Rodriguez', 'role': 'volunteer', 'volunteer_type': 'Social Worker', 'organization': 'Municipal Crisis Team Mumbai', 'bio': '10 years experience in community mobilization', 'rating': 5.0, 'total_works': 24},
        ]

        user_instances = {}
        for udata in users_data:
            user, created = UserProfile.objects.update_or_create(user_id=udata['user_id'], defaults=udata)
            user_instances[udata['user_id']] = user
            self.stdout.write(f"User: {user.name} ({user.role})")

        # 2. Seed Incidents (Mumbai Landmarks)
        now = timezone.now()
        incidents_data = [
            {'incident_id': 'i1', 'incident_type': 'Flooding', 'severity': 'high', 'description': 'Severe waterlogging near BKC junction following heavy monsoon rain.', 'latitude': 19.0674, 'longitude': 72.8715, 'status': 'in-progress', 'reported_by': user_instances['u1'], 'created_at': now - timedelta(hours=1), 'response_time': 12},
            {'incident_id': 'i2', 'incident_type': 'Medical Emergency', 'severity': 'sos', 'description': 'Medical casualty reported near Dadar Station west exit.', 'latitude': 19.0182, 'longitude': 72.8433, 'status': 'pending', 'reported_by': user_instances['u1'], 'created_at': now - timedelta(minutes=30)},
            {'incident_id': 'i3', 'incident_type': 'Downed Power Line', 'severity': 'medium', 'description': 'Power line blocking main road near Powai Lake.', 'latitude': 19.1176, 'longitude': 72.9060, 'status': 'pending', 'reported_by': user_instances['u1'], 'created_at': now, 'response_time': 5},
        ]

        incident_instances = {}
        for idata in incidents_data:
            inc, _ = Incident.objects.update_or_create(incident_id=idata['incident_id'], defaults=idata)
            incident_instances[idata['incident_id']] = inc
            self.stdout.write(f"Incident: {inc.incident_type} [{inc.severity.upper()}]")

        # 3. Seed Resources (Mumbai Locations: Dadar, Bandra, Andheri, BKC, Colaba)
        resources_data = [
            {'resource_id': 'r1', 'resource_type': 'food', 'quantity': 500, 'latitude': 19.0178, 'longitude': 72.8478, 'updated_by': user_instances['v1'], 'status': 'available'},
            {'resource_id': 'r2', 'resource_type': 'water', 'quantity': 1200, 'latitude': 19.0596, 'longitude': 72.8295, 'updated_by': user_instances['v2'], 'status': 'low'},
            {'resource_id': 'r3', 'resource_type': 'medical', 'quantity': 250, 'latitude': 19.1136, 'longitude': 72.8697, 'updated_by': user_instances['v3'], 'status': 'available'},
            {'resource_id': 'r4', 'resource_type': 'shelter', 'quantity': 80, 'latitude': 19.0657, 'longitude': 72.8686, 'updated_by': user_instances['v1'], 'status': 'available'},
            {'resource_id': 'r5', 'resource_type': 'food', 'quantity': 350, 'latitude': 18.9220, 'longitude': 72.8347, 'updated_by': user_instances['v2'], 'status': 'available'},
        ]

        for rdata in resources_data:
            res, _ = Resource.objects.update_or_create(resource_id=rdata['resource_id'], defaults=rdata)
            self.stdout.write(f"Resource: {res.resource_type} ({res.quantity} units) [Mumbai]")


        # 4. Seed Alerts
        alerts_data = [
            {'alert_id': 'a-i1', 'incident': incident_instances['i1'], 'alert_type': 'Nearby Crisis', 'message': 'EMERGENCY: Flooding reported within 5km.', 'radius_km': 5.0},
            {'alert_id': 'a-i2', 'incident': incident_instances['i2'], 'alert_type': 'Nearby Crisis', 'message': 'EMERGENCY: Medical Emergency reported within 5km.', 'radius_km': 5.0},
        ]

        for adata in alerts_data:
            Alert.objects.update_or_create(alert_id=adata['alert_id'], defaults=adata)

        # 5. Seed Messages
        messages_data = [
            {'message_id': 'm1', 'user': user_instances['a1'], 'user_name': 'Chief Miller', 'role': 'authority', 'text': 'Stay clear of Main St. Rescue teams are operating in that sector.', 'timestamp': now - timedelta(minutes=20), 'channel_id': 'general'},
            {'message_id': 'm2', 'user': user_instances['v1'], 'user_name': 'Sarah Chen', 'role': 'volunteer', 'text': 'I have 20 extra water bottles at the distribution point near the park.', 'timestamp': now - timedelta(minutes=10), 'channel_id': 'general'},
        ]

        for mdata in messages_data:
            ChatMessage.objects.update_or_create(message_id=mdata['message_id'], defaults=mdata)

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with ResqNet crisis data!'))
