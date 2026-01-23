# Context Switching Implementation

## ✅ PRODUCTION-READY SEAMLESS CONTEXT SWITCHING

This document describes the implementation of seamless context switching between Public Site and Admin Dashboard for ADMIN and MODERATOR users.

---

## 🎯 CORE PRINCIPLE

**One User, One Session, Multiple Contexts**

- ✅ Single authentication session
- ✅ Same user across all contexts
- ✅ No re-authentication required
- ✅ Role-based access control enforced
- ✅ Backend security + Frontend UX

---

## 🧩 CONCEPTUAL MODEL

### Application Contexts

| Context | Purpose | Accessible By |
|---------|---------|---------------|
| **Public Site** | Reading, commenting, reacting | Everyone |
| **Admin Dashboard** | Content management, moderation | ADMIN, MODERATOR |

### Access Matrix

| Role | Public Site | Admin Dashboard | User Management |
|------|-------------|-----------------|-----------------|
| **ADMIN** | ✅ | ✅ | ✅ |
| **MODERATOR** | ✅ | ✅ | ❌ (403 Forbidden) |
| **MEMBER** | ✅ | ❌ (403 Forbidden) | ❌ (403 Forbidden) |

---

## 🖥️ USER EXPERIENCE

### 1️⃣ Login Flow

**Moderator logs in:**
- URL: `/login`
- Lands on: Public home page (`/`)
- Session contains: `user_id`, `role`, JWT tokens

### 2️⃣ Context Switch Button

**Location:** Header navigation (visible only to ADMIN & MODERATOR)

**When in Public Context:**
```
[ 🔧 Admin Dashboard ] ← Click to switch
```

**When in Admin Context:**
```
[ 🌐 Public Site ] ← Click to switch
```

**Visual Design:**
- Gradient button (purple/blue)
- Icon + Label
- Smooth hover effects
- Prominent but not intrusive

### 3️⃣ Switching Behavior

**Action:** Click context switch button

**Result:**
- Navigate to target context
- No page reload
- No re-authentication
- Same session maintained
- Button updates dynamically

---

## 🔐 SECURITY IMPLEMENTATION

### Double Enforcement Strategy

Every restricted feature is protected at **TWO LEVELS**:

#### 1. Frontend (UX Layer)
```typescript
// Hide UI elements user shouldn't access
{canAccessAdmin && (
  <button onClick={handleContextSwitch}>
    Switch to Admin Dashboard
  </button>
)}
```

#### 2. Backend (Security Layer)
```python
# Reject unauthorized API calls
class IsModerator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in [UserRole.ADMIN, UserRole.MODERATOR]
```

### Attack Scenarios & Defenses

**Scenario 1: MEMBER manually navigates to `/admin`**
- Frontend: ProtectedRoute redirects to `/403`
- Backend: N/A (no API call made yet)

**Scenario 2: MEMBER calls admin API directly**
- Frontend: May bypass
- Backend: Returns `403 Forbidden` (primary defense)

**Scenario 3: MODERATOR tries to access `/admin/users`**
- Frontend: User Management hidden (no UI)
- Backend: `IsAdmin` permission class returns `403 Forbidden`

**Scenario 4: MODERATOR demoted while logged in**
- Next admin API call: Backend rejects with `403`
- API interceptor: Redirects to `/403` page
- User must re-login to see updated permissions

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Components

#### 1. Header Component (`src/components/Header.tsx`)

**Key Features:**
- Detects current context via `useLocation()`
- Shows context switch button conditionally
- Handles context switching via `useNavigate()`

```typescript
const isInAdminContext = location.pathname.startsWith('/admin');
const canAccessAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MODERATOR;

const handleContextSwitch = () => {
  if (isInAdminContext) {
    navigate('/');  // To public
  } else {
    navigate('/admin');  // To admin
  }
};
```

#### 2. Protected Route (`src/router/ProtectedRoute.tsx`)

**Key Features:**
- Supports array of allowed roles
- Redirects unauthorized to `/403`
- Shows loading state during auth check

```typescript
interface ProtectedRouteProps {
  requiredRole?: UserRole | UserRole[];
}

// Admin routes accept multiple roles
<ProtectedRoute requiredRole={[UserRole.ADMIN, UserRole.MODERATOR]}>
  <AdminDashboard />
</ProtectedRoute>
```

#### 3. Forbidden Page (`src/pages/Forbidden.tsx`)

**Key Features:**
- Friendly 403 error page
- Context-aware messaging
- Navigation options
- Contact administrator prompt

#### 4. API Interceptor (`src/services/api.service.ts`)

**Key Features:**
- Intercepts 403 responses
- Auto-redirects to `/403` page
- Logs unauthorized attempts
- Prevents retry loops

```typescript
if (error.response?.status === 403) {
  console.error('Access forbidden:', error.response.data);
  if (!window.location.pathname.includes('/403')) {
    window.location.href = '/403';
  }
  return Promise.reject(error);
}
```

### Backend Security

#### Permission Classes (`backend/apps/users/permissions.py`)

```python
class IsAdmin(permissions.BasePermission):
    """ADMIN ONLY - User Management"""
    def has_permission(self, request, view):
        return request.user.role == UserRole.ADMIN

class IsModerator(permissions.BasePermission):
    """ADMIN + MODERATOR - Content & Moderation"""
    def has_permission(self, request, view):
        return request.user.role in [UserRole.ADMIN, UserRole.MODERATOR]
```

#### API Endpoint Protection

| Endpoint | Permission | Accessible By |
|----------|-----------|---------------|
| `/api/v1/admin/users/*` | `IsAdmin` | ADMIN only |
| `/api/v1/admin/posts/*` | `IsModerator` | ADMIN, MODERATOR |
| `/api/v1/admin/comments/*` | `IsModerator` | ADMIN, MODERATOR |
| `/api/v1/admin/reports/*` | `IsModerator` | ADMIN, MODERATOR |

---

## 🧪 TESTING SCENARIOS

### Test Case 1: MODERATOR Context Switching

**Steps:**
1. Login as MODERATOR
2. Verify landing on public home page
3. Click "Admin Dashboard" button
4. Verify navigation to `/admin`
5. Verify admin dashboard renders
6. Click "Public Site" button
7. Verify navigation to `/`
8. Verify public content renders

**Expected Results:**
- ✅ No re-authentication required
- ✅ Context switch is instant
- ✅ Button label/icon updates correctly
- ✅ User stays logged in throughout

### Test Case 2: MODERATOR Attempts User Management

**Steps:**
1. Login as MODERATOR
2. Navigate to admin dashboard
3. Verify "Users" menu item is hidden
4. Manually navigate to `/admin?view=users`
5. Verify no error (view state ignored)
6. Attempt API call: `GET /api/v1/admin/users/`

**Expected Results:**
- ✅ Users menu not visible in sidebar
- ✅ Users card not visible in overview
- ✅ API call returns `403 Forbidden`
- ✅ User redirected to `/403` page

### Test Case 3: MEMBER Attempts Admin Access

**Steps:**
1. Login as MEMBER
2. Verify no admin button visible
3. Manually navigate to `/admin`
4. Verify redirect to `/403`
5. Attempt API call: `GET /api/v1/admin/posts/`

**Expected Results:**
- ✅ No admin access visible in UI
- ✅ Frontend redirects to 403 page
- ✅ Backend rejects with `403 Forbidden`

### Test Case 4: Role Change While Logged In

**Steps:**
1. Login as MODERATOR
2. Navigate to admin dashboard
3. Admin demotes user to MEMBER (via different session)
4. MODERATOR attempts admin action (e.g., create post)
5. Observe error handling

**Expected Results:**
- ✅ API call returns `403 Forbidden`
- ✅ User redirected to `/403` page
- ✅ User must logout and re-login to see new role

---

## 📋 IMPLEMENTATION CHECKLIST

### Frontend ✅

- [x] Context switch button in header
- [x] Location-aware button text/icon
- [x] Context switch handler
- [x] 403 Forbidden page
- [x] Protected routes accept role arrays
- [x] API interceptor handles 403 responses
- [x] Context switch styling (gradient button)
- [x] UserRole.MODERATOR enum added

### Backend ✅

- [x] IsModerator permission class
- [x] Content endpoints use IsModerator
- [x] User Management uses IsAdmin only
- [x] All admin viewsets properly protected
- [x] Audit logging for all actions
- [x] 403 responses for unauthorized access

### Documentation ✅

- [x] RBAC implementation guide
- [x] Context switching guide
- [x] Testing scenarios
- [x] Security architecture

---

## 🎨 UI/UX DETAILS

### Context Switch Button

**Location:** Header navigation, between "Content" and user menu

**States:**

**Public Context (show admin button):**
```
🔧 Admin Dashboard
```

**Admin Context (show public button):**
```
🌐 Public Site
```

**Styling:**
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Padding: `8px 16px`
- Border radius: `6px`
- Font weight: `600`
- Hover: Lift effect + shadow
- Transition: Smooth 0.3s

### 403 Page Design

**Layout:**
- Centered container
- White card on gradient background
- Large "403" code
- Clear error message
- Action buttons (Home, Browse Content)
- Help text at bottom

**Colors:**
- Background: Purple gradient
- Card: White with shadow
- Code: Gradient text
- Buttons: Primary (gradient) + Secondary (gray)

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables

No additional environment variables required.

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- React Router v6 required

### Performance

- Context switching is instant (client-side navigation)
- No API calls during switch
- No page reload
- Minimal re-renders

### Security Considerations

1. **Never trust frontend alone** - Backend must validate permissions
2. **Use HTTPS in production** - Protect JWT tokens
3. **Implement rate limiting** - Prevent brute force attacks
4. **Log access attempts** - Monitor unauthorized access
5. **Session timeout** - Expire inactive sessions

---

## 🔄 FUTURE ENHANCEMENTS

Potential improvements:
- [ ] Breadcrumb navigation showing current context
- [ ] Keyboard shortcut for context switch (e.g., Ctrl+Shift+A)
- [ ] Context indicator in page title/favicon
- [ ] Recently visited pages per context
- [ ] Context-specific notifications
- [ ] Admin activity timeline
- [ ] Multi-tab context awareness

---

## 📚 REFERENCES

- [RBAC Implementation Guide](./RBAC_IMPLEMENTATION.md)
- React Router: https://reactrouter.com/
- Django REST Framework Permissions: https://www.django-rest-framework.org/api-guide/permissions/

---

**Last Updated:** January 22, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
