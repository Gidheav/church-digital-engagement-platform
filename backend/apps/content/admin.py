from django.contrib import admin
from .models import Post, PostContentType, Interaction, Draft


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'post_type', 'status', 'is_published', 'created_at']
    list_filter = ['post_type', 'status', 'is_published', 'is_featured']
    search_fields = ['title', 'content', 'author__email']
    date_hierarchy = 'created_at'


@admin.register(PostContentType)
class PostContentTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_system', 'is_enabled', 'sort_order']
    list_filter = ['is_system', 'is_enabled']
    search_fields = ['name', 'slug']


@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'type', 'status', 'is_flagged', 'created_at']
    list_filter = ['type', 'status', 'is_flagged', 'is_question']
    search_fields = ['content', 'user__email', 'post__title']
    date_hierarchy = 'created_at'


@admin.register(Draft)
class DraftAdmin(admin.ModelAdmin):
    list_display = ['draft_title', 'user', 'content_type', 'version', 'last_autosave_at']
    list_filter = ['content_type', 'is_published_draft']
    search_fields = ['draft_title', 'user__email', 'post__title']
    date_hierarchy = 'last_autosave_at'
    readonly_fields = ['version', 'created_at', 'last_autosave_at']
