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
        """
        Handle POST request for email verification initiation.
        Returns consistent JSON structure with success, message, and data fields.
        """
        try:
            result = EmailVerificationService.initiate_verification(
                user=request.user,
                request=request
            )
            
            # CRITICAL DEBUG - See what we're actually returning
            import json
            print(f"\n[DEBUG] ===== RESPONSE STRUCTURE DIAGNOSIS =====")
            print(f"[DEBUG] RAW RESULT TYPE: {type(result)}")
            print(f"[DEBUG] RAW RESULT CONTENT: {result}")
            try:
                print(f"[DEBUG] JSON RESPONSE: {json.dumps(result, indent=2)}")
                print(f"[DEBUG] RESPONSE SIZE: {len(json.dumps(result))} bytes")
            except Exception as json_err:
                print(f"[DEBUG] JSON SERIALIZATION FAILED: {json_err}")
            print(f"[DEBUG] ==========================================\n")
            
            return Response(result, status=status.HTTP_200_OK)
            
        except AlreadyVerifiedError as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except RateLimitError as e:
            return Response({
                'success': False,
                'error': str(e),
                'message': str(e),
                'retry_after_seconds': getattr(e, 'retry_after', 60)
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
        except Exception as e:
            print(f"[ERROR] Email verification failed: {e}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'success': False,
                'error': 'Failed to send verification email',
                'message': 'An internal error occurred. Please try again later.',
                'type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        """Explicitly reject GET requests."""
        return Response(
            {'error': 'Method not allowed', 'message': 'Use POST to send verification email'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


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
