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
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API v1 endpoints
    path('api/v1/', include([
        # Authentication and user management
        path('', include('apps.users.urls')),
        
        # Public endpoints (no auth required)
        path('public/', include('apps.content.public_urls')),
        
        # Comments (public read, authenticated write)
        path('', include('apps.interactions.comment_urls')),
        
        # Admin endpoints
        path('admin/content/', include('apps.content.urls')),
        path('admin/interactions/', include('apps.interactions.urls')),
        path('admin/email/', include('apps.email_campaigns.urls')),
        path('admin/moderation/', include('apps.moderation.urls')),
    ])),
    
    # API Documentation
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
