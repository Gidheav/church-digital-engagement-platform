"""
URL configuration for users app.

Authentication endpoints:
- /auth/register/ - User registration
- /auth/login/ - User login
- /auth/logout/ - User logout
- /auth/refresh/ - Token refresh
- /auth/me/ - Current user profile
- /auth/change-password/ - Change password
"""

from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    CurrentUserView,
    ChangePasswordView,
    AdminUserViewSet,
    CsrfTokenView
)
from .admin_auth_views import AdminRegistrationView, AdminLoginView
from .email_verification_views import (
    InitiateEmailVerificationView,
    ResendEmailVerificationView,
    VerifyEmailView
)

app_name = 'users'

# Router for admin user management
router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    # Admin Authentication (CSRF-exempt, dedicated endpoints)
    path('admin-auth/register/', AdminRegistrationView.as_view(), name='admin-register'),
    path('admin-auth/login/', AdminLoginView.as_view(), name='admin-login'),
    
    # CSRF token endpoint
    path('auth/csrf/', CsrfTokenView.as_view(), name='csrf-token'),
    
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', UserLoginView.as_view(), name='login'),
    path('auth/logout/', UserLogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User profile endpoints
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Email verification endpoints - Testing without csrf_exempt wrapper
    path('auth/verify-email/initiate/', InitiateEmailVerificationView.as_view(), name='initiate-verification'),
    path('auth/verify-email/resend/', ResendEmailVerificationView.as_view(), name='resend-verification'),
    path('auth/verify-email/verify/', VerifyEmailView.as_view(), name='verify-email'),  # GET request, no CSRF needed
    
    # Admin user management
    path('', include(router.urls)),
]
