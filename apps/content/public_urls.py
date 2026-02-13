"""
Public Content URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .public_views import PublicPostViewSet, public_content_types
from .home_views import home_page_content

app_name = 'public_content'

router = DefaultRouter()
router.register(r'posts', PublicPostViewSet, basename='public-post')

urlpatterns = [
    path('home/', home_page_content, name='home-content'),
    path('content-types/', public_content_types, name='content-types'),
    path('', include(router.urls)),
]
