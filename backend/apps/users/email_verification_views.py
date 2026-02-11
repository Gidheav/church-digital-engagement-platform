"""
API endpoints for email verification workflow.

Endpoints:
- POST /api/v1/auth/verify-email/initiate/ - Send verification email
- POST /api/v1/auth/verify-email/resend/ - Resend verification email
- POST /api/v1/auth/verify-email/verify/ - Verify email with token
"""

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes

from .services import EmailVerificationService
from .services.email_verification_service import (
    AlreadyVerifiedError,
    TokenExpiredError,
    InvalidTokenError,
    RateLimitError
)


class InitiateEmailVerificationView(APIView):
    """
    Initiate email verification process.
    
    Sends a verification email to the authenticated user's email address
    with a secure token that expires in 30 minutes.
    
    **Authentication Required:** Yes (JWT)
    **CSRF:** Bypassed via JWTCSRFExemptMiddleware
    
    **Response:**
    - 200: Verification email sent successfully
    - 400: Email already verified
    - 429: Rate limit exceeded (too many recent requests)
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['post']  # Explicitly define allowed methods
    
    @extend_schema(
        tags=['Email Verification'],
        summary='Send verification email',
        description='Sends a verification email to the authenticated user. Token expires in 30 minutes.',
        responses={
            200: OpenApiResponse(
                description='Verification email sent successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'message': 'Verification email sent successfully',
                            'expires_in_minutes': 30
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description='Email already verified'),
            429: OpenApiResponse(description='Rate limit exceeded')
        }
    )
    def post(self, request):
        # SENIOR ENGINEER DEBUG: Print request details
        print("=" * 80)
        print("🔍 INITIATE EMAIL VERIFICATION VIEW HIT")
        print(f"User: {request.user}")
        print(f"User Authenticated: {request.user.is_authenticated}")
        print(f"User ID: {request.user.id if request.user.is_authenticated else 'N/A'}")
        print(f"Auth Header: {request.META.get('HTTP_AUTHORIZATION', 'MISSING')}")
        print(f"Request Path: {request.path}")
        print(f"Request Method: {request.method}")
        print("=" * 80)
        
        try:
            result = EmailVerificationService.initiate_verification(
                user=request.user,
                request=request
            )
            print("✅ SUCCESS: Verification email sent")
            return Response(result, status=status.HTTP_200_OK)
            
        except AlreadyVerifiedError as e:
            print(f"⚠️ Already Verified Error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # PRINT FULL STACK TRACE FOR DEBUGGING
            import traceback
            print(f"\n❌ ERROR IN EMAIL VERIFICATION:")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"Stack trace:")
            traceback.print_exc()
            print(f"\n")
            
            # Return the actual error message to frontend
            error_response = {
                'error': str(e),
                'type': type(e).__name__
            }
            
            # Return appropriate status code based on error type
            if 'already verified' in str(e).lower():
                return Response(error_response, status=status.HTTP_400_BAD_REQUEST)
            elif 'rate limit' in str(e).lower() or 'cooldown' in str(e).lower() or 'wait' in str(e).lower():
                return Response(error_response, status=status.HTTP_429_TOO_MANY_REQUESTS)
            else:
                return Response(error_response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResendEmailVerificationView(APIView):
    """
    Resend email verification.
    
    Generates a new token and resends the verification email.
    Rate limited to prevent abuse (60-second cooldown between requests).
    
    **Authentication Required:** Yes (JWT)
    **CSRF:** Bypassed via JWTCSRFExemptMiddleware
    
    **Response:**
    - 200: Verification email resent successfully
    - 400: Email already verified
    - 429: Rate limit exceeded (too soon after last request)
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['post']  # Explicitly define allowed methods
    
    @extend_schema(
        tags=['Email Verification'],
        summary='Resend verification email',
        description='Resends verification email. Rate limited to once per 60 seconds.',
        responses={
            200: OpenApiResponse(
                description='Verification email resent',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'message': 'Verification email sent successfully',
                            'expires_in_minutes': 30
                        }
                    )
                ]
            ),
            400: OpenApiResponse(description='Email already verified'),
            429: OpenApiResponse(
                description='Rate limit exceeded',
                examples=[
                    OpenApiExample(
                        'Rate Limited',
                        value={'error': 'Please wait 45 seconds before requesting another email'}
                    )
                ]
            )
        }
    )
    def post(self, request):
        try:
            result = EmailVerificationService.resend_verification(
                user=request.user,
                request=request
            )
            return Response(result, status=status.HTTP_200_OK)
            
        except AlreadyVerifiedError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except RateLimitError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to resend verification email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyEmailView(APIView):
    """
    Verify email address using token from email link.
    
    Validates the token and marks the email as verified if valid.
    Tokens expire after 30 minutes and can only be used once.
    
    **Authentication Required:** Yes (JWT)
    **CSRF:** GET request doesn't require CSRF
    
    **Request Body:**
    - token (string): Verification token from email link
    
    **Response:**
    - 200: Email verified successfully
    - 400: Invalid, expired, or already used token
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post']  # Allow both GET and POST
    
    @extend_schema(
        tags=['Email Verification'],
        summary='Verify email with token',
        description='Verifies user email using the token from verification email.',
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'token': {
                        'type': 'string',
                        'description': 'Verification token from email'
                    }
                },
                'required': ['token']
            }
        },
        responses={
            200: OpenApiResponse(
                description='Email verified successfully',
                examples=[
                    OpenApiExample(
                        'Success',
                        value={
                            'success': True,
                            'message': 'Email verified successfully',
                            'verified_at': '2026-02-11T10:30:00Z'
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description='Invalid or expired token',
                examples=[
                    OpenApiExample(
                        'Expired Token',
                        value={'error': 'Verification token has expired'}
                    ),
                    OpenApiExample(
                        'Invalid Token',
                        value={'error': 'Invalid verification token'}
                    ),
                    OpenApiExample(
                        'Already Verified',
                        value={'error': 'Email is already verified'}
                    )
                ]
            )
        }
    )
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = EmailVerificationService.verify_email(
                user=request.user,
                token=token
            )
            return Response(result, status=status.HTTP_200_OK)
            
        except AlreadyVerifiedError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except TokenExpiredError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except InvalidTokenError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to verify email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
