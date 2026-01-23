# Content Types Feature - Implementation Summary

## Overview
Implemented a production-ready Content Types management system to replace hard-coded post types with dynamic, admin-managed content types.

## What Was Implemented

### 1. Backend - Django

#### New Model: `PostContentType`
**Location:** `backend/apps/content/models.py`

- **Fields:**
  - `id` (UUID): Primary key
  - `slug` (SlugField): Unique, immutable identifier
  - `name` (CharField): Display name
  - `description` (TextField): Optional admin description
  - `is_system` (Boolean): System types are immutable
  - `is_enabled` (Boolean): Only enabled types appear in dropdowns
  - `sort_order` (Integer): Display order
  - `created_at`, `updated_at`: Timestamps

- **Validations:**
  - System types cannot be modified (slug, name, is_system flag)
  - System types cannot be deleted
  - Custom types cannot be deleted if posts reference them
  - Slug must be unique and immutable

#### Updated Model: `Post`
- Added `content_type` ForeignKey to `PostContentType` (nullable for migration)
- Kept legacy `post_type` CharField for backward compatibility
- Added helper methods:
  - `get_content_type_name()`: Returns display name (prefers new FK)
  - `get_content_type_slug()`: Returns slug (prefers new FK)

#### Migrations
- **0005**: Created `PostContentType` table and added `content_type` FK to `Post`
- **0006**: Data migration to:
  - Seed 3 system types: announcement, sermon, article
  - Migrate existing posts from `post_type` to `content_type`

#### API Endpoints
**Location:** `backend/apps/content/content_type_views.py`

**Base URL:** `/api/v1/admin/content/content-types/`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | List all content types | Admin only |
| GET | `/enabled/` | Get enabled types only | Admin only |
| POST | `/` | Create custom type | Admin only |
| PATCH | `/{id}/` | Update custom type | Admin only |
| DELETE | `/{id}/` | Delete custom type | Admin only |
| PATCH | `/{id}/toggle-enabled/` | Toggle enabled state | Admin only |

**Validations:**
- System types: Cannot edit, delete, or disable
- Custom types: Can only delete if no posts use them
- Duplicate slugs rejected
- Slug format validated (lowercase, alphanumeric + hyphens/underscores)

#### Backward Compatibility
- **home_views.py**: Updated to use `content_type` FK with fallback to `post_type`
- **public_views.py**: Updated filtering to support both new slugs and old enum values
- **serializers.py**: Post serializers include both old and new fields

### 2. Frontend - React + TypeScript

#### New Service: `contentType.service.ts`
**Location:** `src/services/contentType.service.ts`

Methods:
- `getAll()`: Fetch all content types
- `getEnabled()`: Fetch only enabled types (for post creation)
- `create(data)`: Create custom type
- `update(id, data)`: Update custom type
- `delete(id)`: Delete custom type
- `toggleEnabled(id)`: Toggle enabled state

#### New Component: `AppSettings.tsx`
**Location:** `src/admin/AppSettings.tsx`

**Features:**
- Table view with columns: Name, Slug, Type, Status, Posts, Order, Actions
- System types highlighted (yellow background, locked indicator)
- Custom types editable with action buttons
- Create modal for new custom types
- Edit modal for existing custom types
- Delete confirmation using new modal system (no `window.confirm`)
- Enable/disable toggle with confirmation

**UI Elements:**
- 🔒 Locked indicator for system types
- Badges: System/Custom, Enabled/Disabled
- Action buttons: Edit (✏️), Toggle (👁️/🚫), Delete (🗑️)
- Responsive design (mobile-friendly)

#### Updated Components

**PostCreate.tsx:**
- Loads enabled content types from API
- Dropdown shows only enabled types
- System types always included
- Uses `content_type` UUID field (not old `post_type` enum)

**PostEdit.tsx:**
- Loads all types (enabled + system) so existing type shows even if disabled
- Displays current content type name
- Shows "(Disabled)" label for disabled types in dropdown
- Uses `content_type` UUID field

**PostList.tsx:**
- Displays `content_type_name` instead of `post_type` enum
- Fallback to `post_type` if `content_type_name` is null

**AdminDashboard.tsx:**
- Added "App Settings" navigation item (⚙️)
- Only visible to ADMIN role (not Moderators)
- Integrated AppSettings component

#### Styling: `AppSettings.css`
- Table layout with hover states
- System types highlighted with yellow background
- Modal dialogs for create/edit
- Responsive design for mobile
- Consistent with Sky Blue brand color

### 3. Access Control

**Backend:**
- All content type endpoints require `IsAuthenticated` + `IsAdmin`
- Moderators: NO ACCESS to App Settings
- Members: NO ACCESS

**Frontend:**
- App Settings menu only visible to ADMIN role
- Route protection via existing auth system
- Content type service uses authenticated API client

### 4. Data Integrity & Safety

**System Types (Immutable):**
- `announcement`, `sermon`, `article`
- Cannot be renamed, edited, deleted, or disabled
- Always appear in post creation dropdowns
- Enforced at model validation and API level

**Custom Types:**
- Admin can create, edit, enable/disable
- Only appear in dropdowns if enabled
- Cannot be deleted if posts use them
- Slug is immutable after creation

**Existing Posts:**
- All existing posts migrated to new `content_type` FK
- Legacy `post_type` field preserved for rollback safety
- Posts continue to display correct type even if type is disabled

**Backward Compatibility:**
- Old `post_type` enum still works for filtering
- Public API accepts both slug and old enum values
- Frontend falls back to `post_type` if `content_type_name` is null

### 5. Testing Checklist

✅ **Backend:**
- Migrations applied successfully (8 posts migrated)
- System types seeded (announcement, sermon, article)
- API endpoints created with proper permissions
- Validation prevents system type modification
- Validation prevents deletion of types with posts

✅ **Frontend:**
- App Settings page integrated into Admin Dashboard
- Content type service created and working
- Post creation uses dynamic types
- Post editing uses dynamic types (shows disabled types)
- Post list displays dynamic type names
- Confirmation modals work (no `window.confirm`)

⏳ **To Test:**
1. Create custom content type (e.g., "Devotion")
2. Verify it appears in post creation dropdown
3. Create post with custom type
4. Try to delete custom type (should fail - posts exist)
5. Try to edit system type (should fail - locked)
6. Disable custom type (should remove from dropdown)
7. Edit existing post with disabled type (should still show)
8. Re-enable custom type (should reappear in dropdown)
9. Refresh page (state should persist)
10. Test as Moderator (App Settings should be hidden)

## File Structure

```
backend/
├── apps/content/
│   ├── models.py (PostContentType, Post updates)
│   ├── serializers.py (ContentType serializers)
│   ├── content_type_views.py (NEW - Admin API)
│   ├── urls.py (Updated routes)
│   ├── home_views.py (Updated filtering)
│   ├── public_views.py (Updated filtering)
│   └── migrations/
│       ├── 0005_*.py (Schema changes)
│       └── 0006_seed_system_content_types.py (Data migration)

frontend/
├── src/
│   ├── admin/
│   │   ├── AppSettings.tsx (NEW - Settings UI)
│   │   ├── AdminDashboard.tsx (Updated - added nav item)
│   │   ├── PostCreate.tsx (Updated - dynamic types)
│   │   ├── PostEdit.tsx (Updated - dynamic types)
│   │   └── PostList.tsx (Updated - display name)
│   ├── services/
│   │   ├── contentType.service.ts (NEW - API client)
│   │   └── post.service.ts (Updated - new fields)
│   └── styles/
│       └── AppSettings.css (NEW - Settings styles)
```

## API Examples

### Get All Content Types
```http
GET /api/v1/admin/content/content-types/
Authorization: Bearer <admin-token>

Response:
{
  "results": [
    {
      "id": "uuid",
      "slug": "announcement",
      "name": "Announcement",
      "description": "Church announcements and updates",
      "is_system": true,
      "is_enabled": true,
      "sort_order": 1,
      "posts_count": 3,
      "can_delete": false
    }
  ]
}
```

### Create Custom Type
```http
POST /api/v1/admin/content/content-types/
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "slug": "devotion",
  "name": "Devotion",
  "description": "Daily devotional content",
  "sort_order": 10
}
```

### Create Post with Dynamic Type
```http
POST /api/v1/admin/content/posts/
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "Morning Prayer",
  "content": "...",
  "content_type": "uuid-of-devotion-type",
  "status": "PUBLISHED"
}
```

## Breaking Changes
❌ **NONE** - Fully backward compatible

- Old `post_type` field still works
- Existing posts continue to function
- Old API filtering still works
- Legacy enum values accepted

## Future Enhancements
- Custom fields per content type
- Content type icons/colors
- Bulk content type operations
- Content type usage analytics
- Template suggestions per type
