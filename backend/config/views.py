"""
Views for serving the React frontend application.
"""
from django.views.generic import TemplateView


class ReactAppView(TemplateView):
    """
    Serves the React application's index.html for all non-API routes.
    
    This view enables React Router to handle client-side routing while
    Django serves the API endpoints. All requests that don't match an
    API route will be forwarded to React's index.html.
    """
    template_name = 'index.html'
