"""
URL configuration for Church Digital Engagement Platform.

API versioning structure:
- /api/v1/auth/ - Authentication endpoints (login, register, refresh)
- /api/v1/users/ - User management endpoints
- /api/v1/content/ - Content management endpoints
- /api/v1/interactions/ - User interaction endpoints
- /api/v1/email/ - Email campaign endpoints
- /api/v1/moderation/ - Content moderation endpoints
- /api/v1/docs/ - API documentation (Swagger/ReDoc)

Frontend:
- / - React application (all non-API routes handled by React Router)
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from .views import ReactAppView
from apps.users.test_views import TestVerificationView  # Senior Engineer debug endpoint

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # DEBUG: Minimal test endpoint to isolate 403 issue
    path('api/test-verify/', TestVerificationView.as_view(), name='test-verify'),
    
    # API v1 endpoints
    path('api/v1/', include([
        # Authentication and user management
        path('', include('apps.users.urls')),
        
        # Public endpoints (no auth required)
        path('public/', include('apps.content.public_urls')),
        path('public/', include('apps.series.public_urls')),
        
        # Comments (public read, authenticated write)
        path('', include('apps.interactions.comment_urls')),
        
        # Admin endpoints
        path('admin/content/', include('apps.content.urls')),
        path('admin/interactions/', include('apps.interactions.urls')),
        path('admin/email/', include('apps.email_campaigns.urls')),
        path('admin/moderation/', include('apps.moderation.urls')),
        path('admin/series/', include('apps.series.urls')),
    ])),
    
    # API Documentation
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve React application for all other routes (must be last)
# This catches all routes not matched above and forwards them to React
# CRITICAL: Exclude api/, admin/, static/, media/ from catch-all
urlpatterns += [
    re_path(r'^(?!api/|admin/|static/|media/).*$', ReactAppView.as_view(), name='react-app'),
]
