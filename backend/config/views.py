"""
Views for serving the React frontend application.
"""
import os
from django.conf import settings
from django.http import HttpResponse, Http404
from django.views.generic import View


class ReactAppView(View):
    """
    Serves the React application's index.html for all non-API routes.
    
    This view enables React Router to handle client-side routing while
    Django serves the API endpoints. All requests that don't match an
    API route will be forwarded to React's index.html.
    """
    
    def get(self, request, *args, **kwargs):
        """
        Serve React's index.html from the collected static files.
        """
        try:
            # Path to the React index.html in collected static files
            index_path = os.path.join(settings.STATIC_ROOT, 'index.html')
            
            with open(index_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            return HttpResponse(html_content, content_type='text/html')
        
        except FileNotFoundError:
            raise Http404(
                "React build not found. Please ensure: "
                "1) React app is built (npm run build), "
                "2) collectstatic has been run, "
                "3) STATICFILES_DIRS includes the React build directory."
            )
