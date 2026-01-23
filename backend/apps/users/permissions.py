"""
Permission classes for role-based access control.

Custom permissions:
- IsAdmin: Only ADMIN users can access (User Management ONLY)
- IsModerator: ADMIN and MODERATOR users can access (Admin Dashboard, Content, Moderation)
- IsMember: MEMBER and ADMIN users can access
- IsOwnerOrAdmin: User must be the owner or ADMIN
"""

from rest_framework import permissions
from .models import UserRole


class IsAdmin(permissions.BasePermission):
    """
    Permission class to allow only ADMIN users.
    Used for User Management endpoints - MODERATOR is explicitly blocked.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.ADMIN
        )


class IsModerator(permissions.BasePermission):
    """
    Permission class to allow ADMIN and MODERATOR users.
    Used for Admin Dashboard, Content Management, and Moderation endpoints.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in [UserRole.ADMIN, UserRole.MODERATOR]
        )


class IsMember(permissions.BasePermission):
    """
    Permission class to allow MEMBER and ADMIN users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in [UserRole.MEMBER, UserRole.ADMIN]
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission class to allow object owners or ADMIN users.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin users can access everything
        if request.user.role == UserRole.ADMIN:
            return True
        
        # Check if object has a 'user' or 'owner' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False
