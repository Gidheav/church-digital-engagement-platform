ADMIN ROLE SPECIFICATION

Role Name: Admin
Role Level: Full system control (highest permission)
Assigned Users: Church Media Team, Church Leadership (select)
Access Method: Secure login → JWT token with ADMIN scope

1️⃣ ADMIN PURPOSE & OBJECTIVE

Manage all content (posts, sermons, announcements)

Moderate member interactions (comments, reactions, questions)

Control user roles and access

Send official communications via email campaigns

Oversee system activity and maintain platform integrity

Ensure content complies with church standards and policies

Admin is the central authority in the platform.

2️⃣ ADMIN FEATURES (BACKEND & FRONTEND)
A. Content Management

Features:

Create, edit, delete posts

Publish/unpublish posts

Assign post type: SERMON, ANNOUNCEMENT, ARTICLE

Enable/disable comments per post

Instructions for Devs:

Backend: Post model + Admin API

Endpoints:

POST /api/v1/admin/posts/ → create

PATCH /api/v1/admin/posts/{id}/ → edit

DELETE /api/v1/admin/posts/{id}/ → soft-delete

Include permission checks (is_admin)

Frontend: Admin dashboard module

Admin sees full post list + action buttons

Status indicators: published/unpublished

B. Interaction Moderation

Features:

Delete inappropriate comments

Disable reactions temporarily

Answer or close member questions

Suspend users if necessary

Instructions for Devs:

Backend: Comment, Reaction, Question, User models

Admin API endpoints for moderation:

DELETE /api/v1/admin/comments/{id}/

PATCH /api/v1/admin/posts/{id}/interactions/disable

PATCH /api/v1/admin/users/{id}/suspend

Frontend:

Display all pending reports/comments/questions

Admin can approve, delete, or flag content

C. User Management

Features:

View all registered users

Assign roles: VISITOR → MEMBER, MEMBER → ADMIN

Suspend or reactivate accounts

Instructions for Devs:

Backend: User model

Admin-only endpoints:

GET /api/v1/admin/users/ → list

PATCH /api/v1/admin/users/{id}/role/ → role change

PATCH /api/v1/admin/users/{id}/suspend/ → suspend/reactivate

Frontend: User management table

Search and filter by role/status

Action buttons with confirmation modals

D. Email Campaigns

Features:

Create, schedule, and send bulk emails

Track delivery and open rates

Only to verified subscribers

Unsubscribe link automatically included

Instructions for Devs:

Backend: EmailSubscription + EmailCampaign models

Admin API:

POST /api/v1/admin/email-campaign/ → create + send

GET /api/v1/admin/email-campaign/ → track history

Frontend: Admin email editor module

Rich-text editor

Preview before send

Selection of subscriber group (all/filtered)

E. Analytics & Audit (Optional MVP)

Features:

Basic activity logs

Number of posts, comments, reactions

Recent login history

Instructions for Devs:

Backend: Logging table

Frontend: Dashboard widgets (minimal)

Only for Admin access

F. Security & Access Control

Admin routes guarded by JWT + role verification

Every action is logged with timestamp and user ID

Only Admins can see suspended users, audit logs, or delete content

Instructions for Devs:

Backend middleware for is_admin check

Soft-delete for posts, comments, reactions

Audit logs automatically created for:

Post creation/edit/deletion

User suspension/reactivation

Email campaign sends

3️⃣ ADMIN DASHBOARD STRUCTURE (FRONTEND)

Suggested sections/components:

/frontend/src/admin/
├── Dashboard/           # Overview stats
├── ContentManager/      # Posts CRUD
├── UserManager/         # Users CRUD, role management
├── InteractionModeration/ # Comments, reactions, questions
├── EmailCampaigns/      # Create & track emails
├── Settings/            # Profile, security
└── Reports/             # Optional analytics & logs


Sidebar navigation: “Dashboard | Content | Users | Moderation | Email | Settings”

Each module fetches only necessary API endpoints

Components are reusable, modular, atomic

Colors: sky blue + white, minimal accents for highlights

4️⃣ ADMIN INSTRUCTIONS FOR DEVS

Implement role-based routing: only Admin sees /admin/* routes

Each feature maps to its own API module

Use service layer for API calls; avoid direct fetch in components

All destructive actions must have confirmation modal

Include soft-delete / undo where possible

Keep UI minimal, use colors as specified

Write unit and integration tests for every API endpoint

5️⃣ EXAMPLES OF ADMIN ACTIONS
Action	Backend Endpoint	Frontend Component
Create post	POST /admin/posts/	ContentManager/CreatePost
Edit post	PATCH /admin/posts/{id}/	ContentManager/EditPost
Delete comment	DELETE /admin/comments/{id}/	InteractionModeration/ListComments
Suspend user	PATCH /admin/users/{id}/suspend	UserManager/ListUsers
Send email	POST /admin/email-campaign/	EmailCampaigns/CreateEmail

✅ SUMMARY

Admin is the single authority of the platform.
All actions are authenticated, logged, and role-protected.
The instructions above give full scope for implementation, from backend models to frontend modules, API endpoints, and dashboard layout.