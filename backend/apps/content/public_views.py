"""
Public Content Views
Read-only endpoints for published content accessible to all users
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Post, PostStatus
from .serializers import PostSerializer, PostListSerializer


class PublicPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only viewset for published posts
    Accessible to all users (no authentication required)
    """
    permission_classes = [AllowAny]
    lookup_field = 'id'  # Can use slug if you add slug field later
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostSerializer
    
    def get_queryset(self):
        """
        Return only PUBLISHED posts (status=PUBLISHED)
        with publish time in the past
        Ensures scheduled and draft posts never leak to public
        """
        queryset = Post.objects.filter(
            status=PostStatus.PUBLISHED,
            is_deleted=False,
            published_at__lte=timezone.now()
        )
        
        # Filter by content type (support both slug and old post_type format)
        type_param = self.request.query_params.get('type')
        if type_param:
            # Try to find by content_type slug first (new way)
            from .models import PostContentType
            try:
                content_type = PostContentType.objects.get(slug=type_param.lower())
                queryset = queryset.filter(content_type=content_type)
            except PostContentType.DoesNotExist:
                # Fallback to old post_type field
                queryset = queryset.filter(post_type=type_param.upper())
        
        return queryset.order_by('-published_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Get single post by ID"""
        instance = self.get_object()
        
        # Increment views count
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
