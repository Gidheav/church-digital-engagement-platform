"""
Public Content URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .public_views import PublicPostViewSet
from .home_views import home_page_content

app_name = 'public_content'

router = DefaultRouter()
router.register(r'posts', PublicPostViewSet, basename='public-post')

urlpatterns = [
    path('home/', home_page_content, name='home-content'),
    path('', include(router.urls)),
]
