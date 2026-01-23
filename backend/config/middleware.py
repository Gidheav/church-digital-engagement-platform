"""
Custom middleware for debugging requests.
"""
import logging

logger = logging.getLogger('django.request')


class RequestLoggingMiddleware:
    """Log all incoming requests with simplified details."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Simple request log
        logger.info(f">>> {request.method} {request.path} | Origin: {request.headers.get('Origin', 'N/A')}")
        
        response = self.get_response(request)
        
        # Simple response log
        logger.info(f"<<< {response.status_code} {request.path}")
        
        return response
