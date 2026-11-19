"""
Views for serving the React frontend application and health check.
"""
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.template.exceptions import TemplateDoesNotExist
from django.conf import settings
import os


def health_check(request):
    """Lightweight health check endpoint for Render and uptime monitors."""
    return JsonResponse({"status": "ok"}, status=200)


class ReactAppView(TemplateView):
    """
    Serves the React application's index.html for all non-API routes.
    
    If index.html does not exist (e.g. standalone API deployment with frontend
    on Vercel), returns a clean API status JSON with HTTP 200 instead of 500.
    """
    template_name = 'index.html'
    
    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except TemplateDoesNotExist:
            return JsonResponse({
                "status": "online",
                "service": "Church Digital Engagement Platform API",
                "health": "/api/v1/health/",
                "docs": "/api/v1/docs/"
            }, status=200)