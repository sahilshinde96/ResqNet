"""
Django settings for ResqNet Crisis Response Backend.

This configuration handles:
1. PostgreSQL database configuration with automatic fallback to SQLite for local ease of development.
2. Django REST Framework (DRF) configuration for JSON API endpoints.
3. CORS headers allowing cross-origin requests from the React frontend (localhost:3000).
4. Application registration and security settings.
"""

import os
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-resqnet-crisis-management-platform-key-2026')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

# -----------------------------------------------------------------------------
# APPLICATION DEFINITION
# -----------------------------------------------------------------------------

INSTALLED_APPS = [
    # Core Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',        # Django REST Framework for API construction
    'corsheaders',           # CORS headers for React frontend communication

    # ResqNet custom apps
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be placed at the top for CORS handling
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'resqnet_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'resqnet_backend.wsgi.application'
ASGI_APPLICATION = 'resqnet_backend.asgi.application'

# -----------------------------------------------------------------------------
# DATABASE CONFIGURATION (PostgreSQL with SQLite fallback)
# -----------------------------------------------------------------------------
# Reads DATABASE_URL from environment if available (e.g. postgres://user:password@localhost:5432/resqnet_db)
# Otherwise configures PostgreSQL with default credentials or falls back to SQLite for seamless local execution.

DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Use database URL provided in environment (PostgreSQL / CockroachDB / etc.)
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Default database configuration: PostgreSQL with local SQLite fallback
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'resqnet')
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'postgres')
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
    POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')

    # Test if PostgreSQL host/credentials can be configured, fallback to SQLite if needed
    USE_POSTGRES = os.getenv('USE_POSTGRES', 'False').lower() == 'true'

    if USE_POSTGRES:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': POSTGRES_DB,
                'USER': POSTGRES_USER,
                'PASSWORD': POSTGRES_PASSWORD,
                'HOST': POSTGRES_HOST,
                'PORT': POSTGRES_PORT,
            }
        }
    else:
        # Easy local dev setup using SQLite database file
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }

# -----------------------------------------------------------------------------
# REST FRAMEWORK & CORS CONFIGURATION
# -----------------------------------------------------------------------------

REST_FRAMEWORK = {
    # Allow unauthenticated read/write access for quick prototype demonstration
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

# Allow CORS requests from Vite React frontend
CORS_ALLOW_ALL_ORIGINS = True  # Permissive for development ease
CORS_ALLOW_CREDENTIALS = True

# -----------------------------------------------------------------------------
# INTERNATIONALIZATION & STATIC FILES
# -----------------------------------------------------------------------------

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
