"""
Main URL Configuration for ResqNet Backend.

Routes:
- /admin/ : Django Admin Dashboard
- /api/   : ResqNet REST API Endpoints (Incidents, Resources, Users, Chat, Alerts, Evaluations)
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Django Built-in Admin Interface
    path('admin/', admin.site.urls),
    
    # ResqNet REST API routes
    path('api/', include('api.urls')),
]
