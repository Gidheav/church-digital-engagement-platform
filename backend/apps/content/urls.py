"""
Content App URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminPostViewSet
from .content_type_views import ContentTypeViewSet
from .interaction_views import InteractionViewSet

app_name = 'content'

router = DefaultRouter()
router.register(r'posts', AdminPostViewSet, basename='admin-post')
router.register(r'content-types', ContentTypeViewSet, basename='content-type')
router.register(r'interactions', InteractionViewSet, basename='interaction')

urlpatterns = [
    path('', include(router.urls)),
]
