"""
Content Serializers
"""
from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Post, PostType, PostStatus, PostContentType


class PostContentTypeSerializer(serializers.ModelSerializer):
    """Serializer for PostContentType - read/list operations"""
    posts_count = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = PostContentType
        fields = [
            'id', 'slug', 'name', 'description', 'is_system', 'is_enabled',
            'sort_order', 'posts_count', 'can_delete', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'posts_count', 'can_delete']
    
    def get_posts_count(self, obj):
        """Return count of posts using this content type"""
        return obj.posts.count()
    
    def get_can_delete(self, obj):
        """Can only delete custom types with no posts"""
        return not obj.is_system and obj.posts.count() == 0


class PostContentTypeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating custom content types (Admin only)"""
    
    class Meta:
        model = PostContentType
        fields = ['slug', 'name', 'description', 'sort_order']
    
    def validate_slug(self, value):
        """Ensure slug is lowercase and valid"""
        if not value.islower():
            raise serializers.ValidationError("Slug must be lowercase")
        if not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError("Slug must contain only letters, numbers, hyphens, and underscores")
        return value
    
    def create(self, validated_data):
        # Custom types are always non-system and enabled by default
        validated_data['is_system'] = False
        validated_data['is_enabled'] = True
        return super().create(validated_data)


class PostContentTypeUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating content types (custom only, system types locked)"""
    
    class Meta:
        model = PostContentType
        fields = ['name', 'description', 'is_enabled', 'sort_order']
    
    def validate(self, attrs):
        """Prevent editing system types"""
        if self.instance and self.instance.is_system:
            # Only allow toggling is_enabled for system types (though we shouldn't allow this either per requirements)
            # Per requirements: System types cannot be modified in any way
            raise serializers.ValidationError("Cannot modify system content types")
        return attrs


class PostSerializer(serializers.ModelSerializer):
    """Serializer for Post model"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    comments_count = serializers.SerializerMethodField()
    reactions_count = serializers.SerializerMethodField()
    content_type_name = serializers.CharField(source='get_content_type_name', read_only=True)
    content_type_slug = serializers.CharField(source='get_content_type_slug', read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'post_type', 'content_type', 'content_type_name',
            'content_type_slug', 'author', 'author_name', 'author_email', 'is_published',
            'published_at', 'status', 'comments_enabled', 'reactions_enabled',
            'featured_image', 'video_url', 'audio_url', 'views_count', 'comments_count',
            'reactions_count', 'is_featured', 'featured_priority', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'views_count', 'created_at', 'updated_at',
                           'comments_count', 'reactions_count', 'content_type_name', 'content_type_slug']
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_deleted=False).count()
    
    def get_reactions_count(self, obj):
        return obj.reactions.count()


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts"""
    status = serializers.ChoiceField(
        choices=PostStatus.choices,
        default=PostStatus.DRAFT,
        help_text="DRAFT or PUBLISHED"
    )
    # Accept either content_type (new FK) or post_type (legacy)
    content_type = serializers.PrimaryKeyRelatedField(
        queryset=PostContentType.objects.filter(is_enabled=True),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Post
        fields = [
            'title', 'content', 'post_type', 'content_type', 'status', 'comments_enabled',
            'reactions_enabled', 'featured_image', 'video_url', 'audio_url',
            'is_featured', 'featured_priority'
        ]
    
    def create(self, validated_data):
        """
        Create post with proper timestamp handling
        - If status=PUBLISHED: Set published_at and is_published
        - If status=DRAFT: Leave published_at as None
        """
        status = validated_data.get('status', PostStatus.DRAFT)
        post = Post(**validated_data)
        
        if status == PostStatus.PUBLISHED:
            post.is_published = True
            post.published_at = timezone.now()
        
        post.save()
        return post


class PostUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating posts
    Protects published_at from being overwritten
    """
    
    class Meta:
        model = Post
        fields = [
            'title', 'content', 'post_type', 'comments_enabled',
            'reactions_enabled', 'featured_image', 'video_url', 'audio_url',
            'is_featured', 'featured_priority'
        ]
        # Explicitly exclude published_at from updates
        read_only_fields = ['published_at']
    
    def update(self, instance, validated_data):
        """
        Update post preserving published_at
        - Never overwrites published_at
        - updated_at is handled by Django's auto_now
        """
        # Update all allowed fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        
        instance.save()
        return instance


class PostPublishSerializer(serializers.Serializer):
    """Serializer for publishing/unpublishing posts"""
    is_published = serializers.BooleanField()


class PostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing posts"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    comments_count = serializers.SerializerMethodField()
    reactions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'post_type', 'author_name', 'is_published',
            'published_at', 'status', 'views_count', 'comments_count', 'reactions_count',
            'is_featured', 'featured_priority', 'created_at'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_deleted=False).count()
    
    def get_reactions_count(self, obj):
        return obj.reactions.count()
