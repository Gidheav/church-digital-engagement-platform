"""
Views for user authentication and management.

Endpoints:
- POST /api/v1/auth/register/ - User registration
- POST /api/v1/auth/login/ - User login
- POST /api/v1/auth/logout/ - User logout
- GET /api/v1/auth/me/ - Current user profile
- PATCH /api/v1/auth/me/ - Update user profile
- POST /api/v1/auth/change-password/ - Change password
"""

from rest_framework import status, generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.utils import timezone

from .models import User, UserRole
from .permissions import IsAdmin
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    TokenResponseSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer
)


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        responses={201: TokenResponseSerializer, 400: OpenApiResponse(description='Validation errors')},
        tags=['Authentication']
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """User login endpoint."""
    permission_classes = [permissions.AllowAny]
    serializer_class = UserLoginSerializer
    
    @extend_schema(
        request=UserLoginSerializer,
        responses={200: TokenResponseSerializer, 400: OpenApiResponse(description='Invalid credentials')},
        tags=['Authentication']
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    """User logout endpoint."""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request={'application/json': {'refresh': 'string'}},
        responses={205: OpenApiResponse(description='Successfully logged out'), 400: OpenApiResponse(description='Invalid token')},
        tags=['Authentication']
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserProfileUpdateSerializer
    
    @extend_schema(responses={200: UserSerializer}, tags=['User Profile'])
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(request=UserProfileUpdateSerializer, responses={200: UserSerializer}, tags=['User Profile'])
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """Change user password endpoint."""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: OpenApiResponse(description='Password changed successfully'), 400: OpenApiResponse(description='Validation errors')},
        tags=['User Profile']
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


# Admin User Management Views

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing all users with comprehensive features:
    - User list with filtering, search, and pagination
    - User detail view with activity summary
    - Role management with safety checks
    - Suspension management with reasons and expiry
    - Email subscription control
    - Complete audit logging
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = User.objects.all()
    http_method_names = ['get', 'patch', 'post']  # No DELETE - accounts are never deleted
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'list':
            from .serializers import AdminUserListSerializer
            return AdminUserListSerializer
        elif self.action == 'retrieve':
            from .serializers import AdminUserDetailSerializer
            return AdminUserDetailSerializer
        elif self.action == 'change_role':
            from .serializers import ChangeRoleSerializer
            return ChangeRoleSerializer
        elif self.action == 'suspend':
            from .serializers import SuspendUserSerializer
            return SuspendUserSerializer
        elif self.action == 'update_email_subscription':
            from .serializers import UpdateEmailSubscriptionSerializer
            return UpdateEmailSubscriptionSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        Get filtered queryset with all user management filters.
        CRITICAL: Excludes ADMIN users - they are system-level and must not appear in user management.
        """
        # EXCLUDE ADMIN USERS - they are protected system accounts
        queryset = User.objects.exclude(role=UserRole.ADMIN).select_related('suspended_by')
        
        # Filter by role (only MEMBER and MODERATOR are manageable)
        role = self.request.query_params.get('role')
        if role and role in [UserRole.MEMBER, UserRole.MODERATOR]:
            queryset = queryset.filter(role=role)
        
        # Filter by suspended status (is_active is always True except when suspended)
        is_suspended = self.request.query_params.get('is_suspended')
        if is_suspended is not None:
            queryset = queryset.filter(is_suspended=is_suspended.lower() == 'true')
        
        # Filter by email verified
        email_verified = self.request.query_params.get('email_verified')
        if email_verified is not None:
            queryset = queryset.filter(email_verified=email_verified.lower() == 'true')
        
        # Filter by email subscription
        email_subscribed = self.request.query_params.get('email_subscribed')
        if email_subscribed is not None:
            queryset = queryset.filter(email_subscribed=email_subscribed.lower() == 'true')
        
        # Search by email or name
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Sort by created_at (date_joined) by default
        sort_by = self.request.query_params.get('sort_by', '-date_joined')
        if sort_by in ['email', '-email', 'date_joined', '-date_joined', 'last_login', '-last_login', 'role', '-role']:
            queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by('-date_joined')
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Get user detail with activity summary."""
        user = self.get_object()
        serializer = self.get_serializer(user)
        
        # Get activity stats
        from apps.content.models import Post
        from apps.interactions.models import Comment, Reaction
        
        activity_data = {
            'posts_count': Post.objects.filter(author=user).count(),
            'comments_count': Comment.objects.filter(user=user).count(),  # Comment uses 'user' field
            'reactions_count': Reaction.objects.filter(user=user).count(),
        }
        
        response_data = serializer.data
        response_data['activity'] = activity_data
        
        return Response(response_data)
    
    def partial_update(self, request, *args, **kwargs):
        """
        Atomic update of user status and/or role.
        Handles both is_suspended and role changes in a single transaction.
        
        Expected payload:
        {
            "is_suspended": true/false,
            "role": "MEMBER" or "MODERATOR",
            "reason": "optional suspension reason"
        }
        """
        from django.db import transaction
        from apps.moderation.models import AuditLog
        
        user = self.get_object()
        old_role = user.role
        old_suspended = user.is_suspended
        
        # Extract fields
        new_suspended = request.data.get('is_suspended')
        new_role = request.data.get('role')
        reason = request.data.get('reason', '')
        
        # Validation
        if new_role and new_role not in [UserRole.MEMBER, UserRole.MODERATOR]:
            return Response(
                {'error': 'Invalid role. Only MEMBER and MODERATOR are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atomic update
        with transaction.atomic():
            changes = []
            
            # Update role if changed
            if new_role and new_role != old_role:
                user.role = new_role
                changes.append(f'Role: {old_role} → {new_role}')
                
                # Create audit log for role change
                AuditLog.objects.create(
                    user=request.user,
                    action_type='ROLE_CHANGE',
                    content_object=user,
                    description=f'Changed {user.email} role from {old_role} to {new_role}. Reason: {reason or "No reason provided"}'
                )
            
            # Update suspension status if changed
            if new_suspended is not None and new_suspended != old_suspended:
                user.is_suspended = new_suspended
                
                if new_suspended:
                    # Suspending user
                    user.suspended_by = request.user
                    user.suspended_at = timezone.now()
                    user.suspension_reason = reason or 'Suspended by admin'
                    changes.append(f'Status: ACTIVE → SUSPENDED')
                    
                    AuditLog.objects.create(
                        user=request.user,
                        action_type='SUSPEND',
                        content_object=user,
                        description=f'Suspended {user.email}. Reason: {user.suspension_reason}'
                    )
                else:
                    # Unsuspending user
                    user.suspended_by = None
                    user.suspended_at = None
                    user.suspension_reason = None
                    user.suspension_expires_at = None
                    changes.append(f'Status: SUSPENDED → ACTIVE')
                    
                    AuditLog.objects.create(
                        user=request.user,
                        action_type='REACTIVATE',
                        content_object=user,
                        description=f'Unsuspended {user.email}'
                    )
            
            if changes:
                user.save()
                return Response({
                    'message': 'User updated successfully',
                    'changes': changes
                })
            else:
                return Response({'message': 'No changes made'})
    
    @action(detail=True, methods=['patch'])
    def change_role(self, request, pk=None):
        """
        Change user role between MEMBER and MODERATOR only.
        - Only MEMBER ↔ MODERATOR transitions allowed
        - Cannot change ADMIN users (they're excluded from queryset)
        - Requires confirmation via reason parameter
        - All changes are logged
        """
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_role = serializer.validated_data['role']
        reason = serializer.validated_data.get('reason', '')
        
        # Validate: Only MEMBER and MODERATOR roles are allowed
        if new_role not in [UserRole.MEMBER, UserRole.MODERATOR]:
            return Response(
                {'error': 'Only MEMBER and MODERATOR roles are allowed in user management'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Safety check: Prevent changing own role if you're an admin viewing this somehow
        if user == request.user:
            return Response(
                {'error': 'Cannot change your own role'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_role = user.role
        user.role = new_role
        user.save()
        
        # Create audit log
        from apps.content.views import create_audit_log
        from apps.moderation.models import ActionType
        create_audit_log(
            user=request.user,
            action_type=ActionType.ROLE_CHANGE,
            description=f"Changed {user.email} role from {old_role} to {new_role}. Reason: {reason or 'Not provided'}",
            content_object=user,
            request=request
        )
        
        from .serializers import AdminUserDetailSerializer
        return Response({
            'message': 'Role changed successfully',
            'user': AdminUserDetailSerializer(user).data
        })
    
    @action(detail=True, methods=['patch'])
    def suspend(self, request, pk=None):
        """
        Suspend a user account (MEMBER or MODERATOR only).
        - Cannot suspend yourself
        - Requires suspension reason
        - Sets is_suspended=True (account remains is_active=True)
        """
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reason = serializer.validated_data['reason']
        expires_at = serializer.validated_data.get('expires_at')
        
        # Safety check: Cannot suspend yourself
        if user == request.user:
            return Response(
                {'error': 'Cannot suspend your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Apply suspension using model method
        user.suspend(
            suspended_by=request.user,
            reason=reason,
            expires_at=expires_at
        )
        
        # Create audit log
        from apps.content.views import create_audit_log
        from apps.moderation.models import ActionType
        expiry_text = f" (expires: {expires_at})" if expires_at else ""
        create_audit_log(
            user=request.user,
            action_type=ActionType.SUSPEND,
            description=f"Suspended user: {user.email}. Reason: {reason}{expiry_text}",
            content_object=user,
            request=request
        )
        
        from .serializers import AdminUserDetailSerializer
        return Response({
            'message': 'User suspended successfully',
            'user': AdminUserDetailSerializer(user).data
        })
    
    @action(detail=True, methods=['patch'])
    def unsuspend(self, request, pk=None):
        """Reactivate a suspended user account."""
        user = self.get_object()
        
        if not user.is_suspended:
            return Response(
                {'error': 'User is not currently suspended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Remove suspension using model method
        user.unsuspend()
        
        # Create audit log
        from apps.content.views import create_audit_log
        from apps.moderation.models import ActionType
        create_audit_log(
            user=request.user,
            action_type=ActionType.REACTIVATE,
            description=f"Removed suspension from user: {user.email}",
            content_object=user,
            request=request
        )
        
        from .serializers import AdminUserDetailSerializer
        return Response({
            'message': 'User unsuspended successfully',
            'user': AdminUserDetailSerializer(user).data
        })
    
    @action(detail=True, methods=['patch'])
    def update_email_subscription(self, request, pk=None):
        """Update user's email subscription preference."""
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email_subscribed = serializer.validated_data['email_subscribed']
        user.email_subscribed = email_subscribed
        user.save()
        
        # Create audit log
        from apps.content.views import create_audit_log
        from apps.moderation.models import ActionType
        action_text = 'subscribed to' if email_subscribed else 'unsubscribed from'
        create_audit_log(
            user=request.user,
            action_type=ActionType.OTHER,
            description=f"User {user.email} {action_text} email campaigns",
            content_object=user,
            request=request
        )
        
        from .serializers import AdminUserDetailSerializer
        return Response({
            'message': f'Email subscription updated successfully',
            'user': AdminUserDetailSerializer(user).data
        })
    
    @action(detail=False, methods=['post'])
    def bulk_export(self, request):
        """Export selected users to CSV."""
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {'error': 'No users selected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(id__in=user_ids)
        
        # Create CSV response
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Email', 'Name', 'Role', 'Status', 'Email Verified', 'Joined', 'Last Login'])
        
        for user in users:
            writer.writerow([
                user.email,
                user.get_full_name(),
                user.role,
                user.account_status,
                'Yes' if user.email_verified else 'No',
                user.date_joined.strftime('%Y-%m-%d'),
                user.last_login.strftime('%Y-%m-%d') if user.last_login else 'Never'
            ])
        
        # Create audit log
        from apps.content.views import create_audit_log
        from apps.moderation.models import ActionType
        create_audit_log(
            user=request.user,
            action_type=ActionType.OTHER,
            description=f"Exported {len(users)} users to CSV",
            content_object=None,
            request=request
        )
        
        return response


class CsrfTokenView(APIView):
    """
    CSRF token endpoint for cross-origin requests.
    Returns a CSRF cookie that can be used for subsequent requests.
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        responses={200: OpenApiResponse(description='CSRF token set in cookie')},
        tags=['Authentication']
    )
    def get(self, request):
        """Endpoint to fetch CSRF token."""
        from django.middleware.csrf import get_token
        csrf_token = get_token(request)
        return Response({'detail': 'CSRF cookie set', 'csrfToken': csrf_token}, status=200)
