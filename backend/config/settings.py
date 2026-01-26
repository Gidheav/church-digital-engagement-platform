"""
Django settings for Church Digital Engagement Platform.

This is a production-ready configuration for a church digital platform
that handles authentication, content management, and member engagement.

Security: All sensitive values loaded from environment variables.
Database: PostgreSQL in production, configurable via DATABASE_URL.
Authentication: JWT-based with custom User model.
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config, Csv
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ==============================================================================
# SECURITY SETTINGS
# ==============================================================================

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Enable detailed error logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

#ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())
ALLOWED_HOSTS = ['*']


# ==============================================================================
# APPLICATION DEFINITION
# ==============================================================================

INSTALLED_APPS = [
    # Django core apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    
    # Local apps
    'apps.users',
    'apps.content',
    'apps.interactions',
    'apps.email_campaigns',
    'apps.moderation',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'config.middleware.RequestLoggingMiddleware',
]

ROOT_URLCONF = 'config.urls'

# Disable CommonMiddleware URL adjustments
APPEND_SLASH = False
PREPEND_WWW = False

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR / 'frontend-build',  # For React index.html
        ],
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

WSGI_APPLICATION = 'config.wsgi.application'


# ==============================================================================
# DATABASE CONFIGURATION
# ==============================================================================
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# Use DATABASE_URL for PostgreSQL in production, fallback to SQLite for development
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default=f'sqlite:///{BASE_DIR / "db.sqlite3"}'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# PostgreSQL-specific optimizations
if DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
    DATABASES['default'].update({
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000',  # 30 seconds
        },
        'ATOMIC_REQUESTS': True,
        'AUTOCOMMIT': True,
    })


# ==============================================================================
# AUTHENTICATION & USER MODEL
# ==============================================================================

# Custom user model with UUID primary key
AUTH_USER_MODEL = 'users.User'

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# ==============================================================================
# REST FRAMEWORK CONFIGURATION
# ==============================================================================

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ),
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
    'NON_FIELD_ERRORS_KEY': 'error',
    'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%SZ',
}


# ==============================================================================
# JWT CONFIGURATION
# ==============================================================================

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=config('JWT_ACCESS_TOKEN_LIFETIME', default=60, cast=int)
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        minutes=config('JWT_REFRESH_TOKEN_LIFETIME', default=1440, cast=int)
    ),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET_KEY', default=SECRET_KEY),
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}


# ==============================================================================
# CORS CONFIGURATION
# ==============================================================================

# CORS settings
# NOTE: CORS_ALLOW_ALL_ORIGINS = True does NOT work with CORS_ALLOW_CREDENTIALS = True
# Must explicitly list allowed origins when using credentials
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://g98l5wj0-3000.uks1.devtunnels.ms',  # React Dev Tunnel
    'https://g98l5wj0-8000.uks1.devtunnels.ms',  # Django Dev Tunnel (for cross-origin)
    'https://church-digital-engagement-platform.onrender.com',  # Production on Render
]
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours

# CSRF CONFIGURATION
# ==============================================================================
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://g98l5wj0-3000.uks1.devtunnels.ms',  # React Dev Tunnel
    'https://g98l5wj0-8000.uks1.devtunnels.ms',  # Django Dev Tunnel
    'https://church-digital-engagement-platform.onrender.com',  # Production on Render
]
# Allow Dev Tunnel origin for cookies
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SECURE = True

# ==============================================================================
# INTERNATIONALIZATION
# ==============================================================================
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'  # Store all times in UTC (single source of truth)

USE_I18N = True

USE_TZ = True  # Always use timezone-aware datetimes


# ==============================================================================
# STATIC & MEDIA FILES
# ==============================================================================
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Include React build output in static files collection
# Point to the 'static' subdirectory inside the React build
STATICFILES_DIRS = [
    BASE_DIR / 'frontend-build' / 'static',  # React static assets (js, css, media)
]

# Whitenoise configuration for serving static files efficiently
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
WHITENOISE_USE_FINDERS = True
WHITENOISE_AUTOREFRESH = True if DEBUG else False
WHITENOISE_INDEX_FILE = True  # Serve index.html for directory requests

MEDIA_URL = '/media/'
MEDIA_ROOT = config('MEDIA_ROOT', default=str(BASE_DIR / 'media'))


# ==============================================================================
# EMAIL CONFIGURATION
# ==============================================================================

EMAIL_BACKEND = config(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = config('EMAIL_HOST', default='localhost')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@example.com')



# ==============================================================================
# CELERY CONFIGURATION (for background tasks)
# ==============================================================================

CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE


# ==============================================================================
# SECURITY SETTINGS (Development & Dev Tunnels)
# ==============================================================================

# Security settings - Development only
# Disable ALL HTTPS/SSL redirects in development
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = None
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False


# ==============================================================================
# SECURITY SETTINGS (Production)
# ==============================================================================

if not DEBUG:
    # HTTPS settings
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Additional security headers
    X_FRAME_OPTIONS = 'DENY'


# ==============================================================================
# API DOCUMENTATION (DRF Spectacular)
# ==============================================================================

SPECTACULAR_SETTINGS = {
    'TITLE': 'Church Digital Engagement Platform API',
    'DESCRIPTION': 'API documentation for the Church Digital Platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
}


# ==============================================================================
# APPLICATION-SPECIFIC SETTINGS
# ==============================================================================

# Site name for email templates and notifications
SITE_NAME = config('SITE_NAME', default='Church Digital Platform')

# Default user role for new registrations
DEFAULT_USER_ROLE = 'VISITOR'

# Content moderation settings
AUTO_APPROVE_CONTENT = config('AUTO_APPROVE_CONTENT', default=False, cast=bool)


# ==============================================================================
# DEFAULT FIELD TYPE
# ==============================================================================
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==============================================================================
# DJANGO DEBUG TOOLBAR (Development Only)
# ==============================================================================

# TEMPORARILY DISABLED - Causing namespace issues
# if DEBUG:
#     INSTALLED_APPS += ['debug_toolbar']
#     MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
#     
#     INTERNAL_IPS = ['127.0.0.1', 'localhost']
#     
#     DEBUG_TOOLBAR_CONFIG = {
#         'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
#     }

