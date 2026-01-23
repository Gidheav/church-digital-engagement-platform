# Rich Text Editor Integration - Setup Instructions

## Overview
Professional WYSIWYG rich text editor integrated into the Church Digital Engagement Platform admin portal for creating and editing posts with advanced formatting capabilities.

## Package Installation

Run the following commands in your project root:

```powershell
# Install React Quill (rich text editor)
npm install react-quill

# Install Quill (peer dependency)
npm install quill

# Install DOMPurify (HTML sanitization for display)
npm install dompurify

# Install type definitions
npm install --save-dev @types/react-quill @types/dompurify
```

## Files Created

### 1. RichTextEditor Component
**Location:** `src/components/RichTextEditor.tsx`
- Full-featured WYSIWYG editor with custom toolbar
- Support for text formatting, headings, lists, links, images
- Color picker for text and background colors
- Character and word count
- Fullscreen mode
- Image upload handling
- Undo/Redo functionality

### 2. RichTextEditor Styles
**Location:** `src/components/RichTextEditor.css`
- Professional styling matching Microsoft Word aesthetic
- Responsive design for mobile devices
- Dark mode support
- Custom toolbar styling
- Fullscreen mode styles

### 3. PostContent Display Component
**Location:** `src/components/PostContent.tsx`
- Safely renders HTML content with DOMPurify sanitization
- Prevents XSS attacks while preserving formatting
- Used for displaying posts on the public site

### 4. PostContent Styles
**Location:** `src/components/PostContent.css`
- Ensures content displays exactly as created
- Matches editor styles for consistency
- Responsive and print-friendly

## Files Modified

### 1. PostCreate.tsx
**Location:** `src/admin/PostCreate.tsx`
- Replaced basic textarea with RichTextEditor component
- Added handleContentChange for editor state management
- Added handleImageUpload for inline image uploads
- Content now stored as HTML

### 2. PostEdit.tsx
**Location:** `src/admin/PostEdit.tsx`
- Replaced basic textarea with RichTextEditor component
- Added handleContentChange for editor state management
- Added handleImageUpload for inline image uploads
- Loads existing HTML content into editor

## Backend Requirements

### 1. Database Schema
The `content` field in your Post model should store HTML. Ensure it can handle large text:

```python
# Django Model Example
class Post(models.Model):
    # ... other fields
    content = models.TextField()  # Already supports HTML
    # ... other fields
```

No database migration needed if using TextField.

### 2. Image Upload Endpoint (Required for Production)

You need to implement an image upload endpoint for the rich text editor images:

**Endpoint:** `POST /api/v1/upload/image`

**Request:**
```
Content-Type: multipart/form-data
Body: { image: File }
```

**Response:**
```json
{
  "url": "https://yourdomain.com/media/uploads/image-uuid.jpg",
  "filename": "image-uuid.jpg"
}
```

**Django Implementation Example:**

```python
# backend/apps/content/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
import uuid
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    """Handle image uploads for rich text editor"""
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=400)
    
    image = request.FILES['image']
    
    # Validate file size (5MB max)
    if image.size > 5 * 1024 * 1024:
        return Response({'error': 'Image size must be less than 5MB'}, status=400)
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if image.content_type not in allowed_types:
        return Response({'error': 'Invalid image type'}, status=400)
    
    # Generate unique filename
    ext = os.path.splitext(image.name)[1]
    filename = f"post-images/{uuid.uuid4()}{ext}"
    
    # Save file
    path = default_storage.save(filename, image)
    url = default_storage.url(path)
    
    return Response({
        'url': request.build_absolute_uri(url),
        'filename': filename
    })
```

**Add to URLs:**
```python
# backend/config/urls.py
from apps.content.views import upload_image

urlpatterns = [
    # ... other patterns
    path('api/v1/upload/image', upload_image, name='upload_image'),
]
```

### 3. Update Frontend Image Upload Handler

Once your backend endpoint is ready, update the image upload handlers in both PostCreate and PostEdit:

```typescript
// src/admin/PostCreate.tsx and PostEdit.tsx
const handleImageUpload = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(
      'http://localhost:8000/api/v1/upload/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      }
    );
    
    return response.data.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};
```

### 4. Content Storage and Retrieval

**No changes needed** - Your existing Post API endpoints already handle text content. HTML will be stored and retrieved the same way as plain text.

## Using PostContent Component

Update your public post display pages to use the new PostContent component:

```tsx
// src/public/ContentDetail.tsx (or wherever you display posts)
import PostContent from '../components/PostContent';

function ContentDetail() {
  const [post, setPost] = useState<Post | null>(null);

  return (
    <div className="post-detail">
      <h1>{post?.title}</h1>
      
      {/* Replace this: */}
      {/* <p>{post?.content}</p> */}
      
      {/* With this: */}
      <PostContent content={post?.content || ''} />
    </div>
  );
}
```

## Security Considerations

1. **XSS Prevention:** The PostContent component uses DOMPurify to sanitize HTML before rendering
2. **Content Security Policy:** Consider adding CSP headers to your backend
3. **Image Upload Security:**
   - Validate file types on backend
   - Scan for malware if possible
   - Limit file sizes (5MB recommended)
   - Use unique filenames to prevent overwriting

## Testing

1. **Create a new post:**
   - Navigate to Create Post page
   - Use all formatting options (bold, colors, lists, etc.)
   - Upload an image
   - Save as draft or publish

2. **Edit existing post:**
   - Open an existing post in edit mode
   - Verify content loads correctly in editor
   - Make changes and save

3. **View published post:**
   - Verify formatting is preserved exactly as created
   - Check responsive display on mobile
   - Test all interactive elements (links, images)

## Troubleshooting

### Editor not showing
- Verify React Quill is installed: `npm list react-quill`
- Check browser console for errors
- Ensure Quill CSS is imported correctly

### Images not uploading
- Implement backend upload endpoint (see above)
- Check network tab for 404 errors on upload
- Verify authentication headers are being sent

### Formatting lost when displaying
- Ensure using PostContent component, not raw HTML
- Check DOMPurify configuration
- Verify CSS files are imported

### Content not saving
- Check browser console for API errors
- Verify backend accepts HTML in content field
- Test with simple content first, then complex formatting

## Next Steps

1. ✅ Install required npm packages
2. ✅ Test the rich text editor in Create Post page
3. ✅ Test loading existing content in Edit Post page
4. 🔲 Implement backend image upload endpoint
5. 🔲 Update public pages to use PostContent component
6. 🔲 Test end-to-end flow
7. 🔲 Train church staff on new editor features

## Additional Features (Optional)

Consider adding these enhancements:

- **Auto-save drafts:** Save content every 30 seconds
- **Version history:** Track content changes
- **Templates:** Pre-formatted post templates
- **Media library:** Reuse uploaded images
- **Spell check:** Integrate spell checking
- **SEO preview:** Show how content appears in search results
- **Accessibility checker:** Ensure content meets WCAG standards

## Support

For issues or questions:
1. Check React Quill documentation: https://github.com/zenoamaro/react-quill
2. Check DOMPurify documentation: https://github.com/cure53/DOMPurify
3. Review browser console for error messages
