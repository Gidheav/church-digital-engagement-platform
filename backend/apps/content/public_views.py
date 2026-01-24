"""
Public Content Views
Read-only endpoints for published content accessible to all users
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from .models import Post, PostStatus, PostContentType
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


@api_view(['GET'])
@permission_classes([AllowAny])
def public_content_types(request):
    """
    Public endpoint to get all enabled content types with published post counts.
    Returns all enabled content types (both system and custom) regardless of post count.
    This powers the dynamic filter on the public content library.
    When a custom type is created, deleted, or modified, changes automatically reflect here.
    """
    # Get all enabled content types (both system and custom)
    content_types = PostContentType.objects.filter(is_enabled=True)
    
    # Get published post counts for each content type
    # Only count posts that are published and not deleted, with publish time in past
    result = []
    for ct in content_types:
        count = Post.objects.filter(
            content_type=ct,
            status=PostStatus.PUBLISHED,
            is_deleted=False,
            published_at__lte=timezone.now()
        ).count()
        
        # Include all enabled content types (system and custom)
        # This ensures custom types appear immediately after creation
        result.append({
            'id': str(ct.id),
            'slug': ct.slug,
            'name': ct.name,
            'count': count,
            'is_system': ct.is_system,
            'sort_order': ct.sort_order
        })
    
    # Sort by sort_order, then by name
    result.sort(key=lambda x: (x['sort_order'], x['name']))
    
    return Response({
        'results': result,
        'count': len(result)
    })
