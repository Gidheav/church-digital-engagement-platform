# Church Digital Engagement Platform

A production-grade, full-stack web application for churches and faith-based organizations. Built to consolidate sermon publishing, member engagement, payment processing, email campaigns, and administrative operations into a single self-hosted platform.

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)](https://github.com/Gidheav/church-digital-engagement-platform)
[![Backend](https://img.shields.io/badge/backend-Django%205%20%2B%20DRF-092E20)](https://www.djangoproject.com/)
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20TypeScript-61DAFB)](https://react.dev/)
[![Database](https://img.shields.io/badge/database-PostgreSQL%2016-336791)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-proprietary-lightgrey)]()

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution Overview](#solution-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Core Modules](#core-modules)
- [Role-Based Access Control](#role-based-access-control)
- [Payment Processing Pipeline](#payment-processing-pipeline)
- [Real-Time Notification System](#real-time-notification-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Security Model](#security-model)
- [Design Decisions](#design-decisions)
- [Project Status and Roadmap](#project-status-and-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Problem Statement

Most churches rely on a patchwork of disconnected tools for different operational needs: a website builder for the public site, a third-party platform for sermon hosting, a separate email marketing service, manual spreadsheets for member management, and yet another tool for collecting donations. This fragmentation creates three concrete problems:

1. **Data silos.** Member activity, giving history, content engagement, and communication preferences live in separate systems with no shared context. A pastor cannot see which members watched last Sunday's sermon, donated this month, and also unsubscribed from the newsletter, because that information lives in three different dashboards.

2. **Operational overhead.** Staff context-switch between platforms constantly. Publishing a sermon involves uploading to one service, linking it on the website through another, sending a notification email through a third, and manually updating an internal spreadsheet. Each handoff introduces delay and human error.

3. **Limited engagement visibility.** Without a unified data model, churches have no way to measure real engagement across content, community interactions, and financial contributions. They cannot answer basic questions like "which content types drive the most member activity" or "what percentage of active commenters are also donors."

---

## Solution Overview

This platform eliminates those silos by consolidating everything into one application with a shared data model, a single authentication layer, and a unified admin interface.

**What it replaces:**
- WordPress/Squarespace (public website + content management)
- Subsplash/Church Online Platform (sermon hosting + streaming)
- Mailchimp/SendGrid (email campaigns + subscriber management)
- Paystack/Stripe dashboards (donation management)
- Google Sheets (member tracking)

**What it delivers:**
- A public-facing website with sermon library, series organization, event listings, and ministry pages, accessible without authentication
- A member portal with personalized dashboards, comment threads, reaction system, Q&A, and notification preferences
- A content management system with rich-text editing, draft auto-save, scheduled publishing, and media upload
- An admin dashboard with user management, content moderation, email campaigns, audit logging, and analytics
- Integrated payment processing with fraud detection, webhook verification, and full audit trails
- Real-time WebSocket notifications with automatic REST fallback
- A Bible module with offline-first cached access
- A contact form system with admin inbox
- Visitor analytics with device fingerprinting and page-view tracking

The entire stack ships as a Docker Compose deployment: one command to build, one command to start. No vendor lock-in, no recurring SaaS fees beyond hosting.

---

## Architecture

```
                                  Client Requests
                                        |
                                   [ Nginx ]
                                   /        \
                            Static/Media    Dynamic
                            (cached)        Requests
                                              |
                                        [ Daphne/Gunicorn ]
                                        Django 5 + DRF
                                       /      |      \
                              REST API    WebSocket    Celery Tasks
                                |         Channels     (async email,
                                |            |          scheduling)
                                |            |              |
                            [ PostgreSQL ]  [ Redis ]  [ Redis ]
                              Primary DB    Pub/Sub     Broker
                                            + Cache
```

**Request flow:**

1. Nginx terminates SSL, serves static assets (30-day cache) and media files (7-day cache) directly, and proxies everything else upstream to Django.
2. Django runs behind Daphne (ASGI) in Docker Compose for WebSocket support, or Gunicorn (WSGI, 4 workers + 2 threads each) for HTTP-only deployments.
3. The React frontend is built at Docker image build time (multi-stage), collected into Django's static files via Whitenoise, and served as a single-page application. All non-API routes fall through to `ReactAppView`, which serves `index.html` for client-side routing.
4. Background work (email delivery, scheduled content publishing, maintenance) is offloaded to Celery workers backed by Redis as the message broker.
5. Real-time notifications are pushed through Django Channels over WebSocket. If the connection drops, the client falls back to polling the REST notification endpoint.

---

## Tech Stack

### Frontend (320 TypeScript/TSX source files)

| Layer | Technology | Rationale |
|---|---|---|
| Framework | React 18 + TypeScript | Component model scales well, TypeScript catches contract mismatches at compile time |
| Routing | React Router v6 | Supports nested layouts and role-gated route guards |
| Styling (public) | Tailwind CSS 3.4 | Utility classes keep styles colocated with markup, purges unused CSS in production |
| Styling (admin) | CSS Custom Properties design system | Dedicated design token layer for the admin interface, decoupled from public styles |
| HTTP client | Axios with interceptors | Automatic JWT refresh on 401, centralized error handling, request/response logging |
| Rich-text editor | React Quill (Quill 2.0) | Full WYSIWYG with image embed, code blocks, formatting toolbar |
| Icons | Lucide React | Tree-shakeable, consistent stroke weight across 450+ icons |
| Sanitization | DOMPurify | Strips all XSS vectors from user-submitted HTML before DOM insertion |
| State management | React Context API | Auth state, toast notifications, confirmation dialogs, without external deps |
| Client cache | IndexedDB (idb) | Stores Bible module data and content locally for offline access |
| Auth (OAuth) | @react-oauth/google | Google Identity Services integration, token forwarded to backend for verification |

### Backend (319 Python source files across 14 Django apps)

| Layer | Technology | Rationale |
|---|---|---|
| Language | Python 3.12 | Type hints, pattern matching, latest stdlib improvements |
| Framework | Django 5 | Mature ORM, migration system, middleware pipeline, battle-tested security defaults |
| API | Django REST Framework | Serializers, viewsets, permissions, pagination, filtering, throttling out of the box |
| Auth | SimpleJWT + Google OAuth | Stateless JWT tokens with configurable expiry and rotation, Google token audience verification on backend |
| Database | PostgreSQL 16 | ACID transactions, full-text search, JSONB for flexible data, proven at scale |
| Task queue | Celery | Distributed task execution for email, scheduled publishing, cleanup jobs |
| Broker/Cache | Redis 7 | In-memory pub/sub for Channels, message broker for Celery, general cache |
| WebSocket | Django Channels + Daphne | Full-duplex real-time communication over ASGI |
| API docs | drf-spectacular | Auto-generates OpenAPI 3.0 schema, Swagger UI, and ReDoc from code |
| Filtering | django-filter | Declarative queryset filtering on API endpoints |
| Config | python-decouple + dj-database-url | 12-factor configuration from environment variables |
| Static files | Whitenoise | Serves compressed static assets from Django without a separate file server |
| Image processing | Pillow | Handles upload, resize, and optimization of user-submitted images |

### Infrastructure

| Component | Technology | Configuration |
|---|---|---|
| Containerization | Docker (multi-stage) | Stage 1: Node 22-alpine builds React. Stage 2: Python 3.12-slim runs Django. Non-root user (`appuser`, UID 1000). |
| Orchestration | Docker Compose v3.8 | 5 services: `db` (Postgres), `redis`, `web` (Django+React), `celery`, `nginx`. Health checks on `db` and `redis`. |
| Reverse proxy | Nginx (Alpine) | WebSocket upgrade support, gzip, static/media file serving, SSL termination ready |
| Health checks | Container-level + HTTP | `pg_isready` for Postgres, `redis-cli ping` for Redis, HTTP probe on `/api/v1/docs/` for the app |

---

## Core Modules

The backend is organized as 14 Django apps, each owning a bounded domain:

| Module | Responsibility | Key Models |
|---|---|---|
| `users` | Registration, login, email verification, password reset, JWT lifecycle, Google OAuth, profile management | `User`, `Profile` |
| `content` | Posts (sermons, articles, devotionals, announcements), draft management, scheduled publishing, media attachments, content types | `Content`, `ContentType`, `Draft`, `Schedule` |
| `series` | Sermon series organization, ordering, public and admin endpoints | `Series`, `SeriesItem` |
| `interactions` | Comments (threaded), reactions (5 types: Like, Amen, Love, Insight, Praise), Q&A with resolution | `Comment`, `Reaction`, `Question` |
| `notifications` | Real-time WebSocket notifications, REST fallback, user preference controls, email digests | `Notification`, `UserPreferences` |
| `payments` | Paystack integration, payment intent lifecycle, webhook processing, signature verification, fraud detection | `PaymentTransaction`, `PaymentIntent`, `PaymentAuditLog` |
| `giving` | Seed/giving catalog with configurable items and amounts | `GivingItem` |
| `payouts` | Payout management and tracking | Payout-related models |
| `email_campaigns` | Newsletter creation, audience segmentation, template management, delivery tracking, subscription management | `Campaign`, `EmailTemplate`, `Subscription` |
| `email` | Standalone transactional email service (verification, password reset, notifications) | Service layer |
| `moderation` | Content flagging, comment moderation queue, audit logging of all administrative actions | `AuditLog`, `ContentFlag` |
| `analytics` | Page-view tracking, unique visitor identification via device fingerprinting, dashboard metrics | `PageView` |
| `bible` | Offline-first Bible text access with client-side IndexedDB caching | Bible data models |
| `contact` | Public contact form submission, admin inbox for review | Contact models |

---

## Role-Based Access Control

Access control is enforced at the API layer through DRF permission classes. The frontend renders UI conditionally based on role, but authorization decisions happen exclusively on the backend. Even if someone modifies the client-side JavaScript, the API will reject unauthorized requests.

Four roles exist in the system:

| Capability | Visitor | Member | Moderator | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse public content, events, series | Yes | Yes | Yes | Yes |
| Search and filter content | Yes | Yes | Yes | Yes |
| Register and authenticate | Yes | Yes | Yes | Yes |
| React to posts (5 reaction types) | -- | Yes | Yes | Yes |
| Comment and reply (threaded) | -- | Yes | Yes | Yes |
| Submit questions for Q&A | -- | Yes | Yes | Yes |
| Access member dashboard and preferences | -- | Yes | Yes | Yes |
| Create and edit own content | -- | -- | Yes | Yes |
| Publish and schedule content | -- | -- | Yes | Yes |
| Moderate comments, Q&A, flagged content | -- | -- | Yes | Yes |
| Edit or delete any content | -- | -- | -- | Yes |
| Manage users (roles, suspension, export) | -- | -- | -- | Yes |
| Send email campaigns | -- | -- | -- | Yes |
| Configure platform settings and content types | -- | -- | -- | Yes |
| View audit logs, analytics, reports | -- | -- | -- | Yes |

Members are required to verify their email address after registration before gaining authenticated access. Account suspension preserves all data but denies login.

---

## Payment Processing Pipeline

Donations are processed through Paystack with a multi-step verification pipeline designed to prevent fraud and ensure auditability.

```
Member clicks "Donate"
        |
        v
  [1] Frontend sends amount + user to backend
        |
        v
  [2] Backend creates PaymentIntent (pre-authorization token)
      - Rate limiting check (per IP, per user)
      - Amount validation
      - Intent expires after 30 minutes
        |
        v
  [3] Frontend redirects to Paystack checkout
      - Card/bank details handled entirely by Paystack
      - Platform never sees raw payment credentials (PCI compliant)
        |
        v
  [4] Paystack processes transaction
        |
        v
  [5] Paystack sends webhook callback to backend
        |
        v
  [6] Backend verifies webhook signature (HMAC SHA512, timing-safe comparison)
        |
        v
  [7] Backend confirms amount matches the original PaymentIntent
        |
        v
  [8] Transaction recorded, notifications dispatched (WebSocket + email)
        |
        v
  [9] Full event chain written to PaymentAuditLog
```

Fraud detection includes per-user and per-IP rate limiting, user-agent tracking, and automatic flagging of suspicious patterns. Every step in the pipeline is logged in `PaymentAuditLog` for compliance and dispute resolution.

---

## Real-Time Notification System

Notifications are delivered through WebSocket (Django Channels) for instant updates, with automatic fallback to REST polling if the WebSocket connection drops.

**Supported notification types:**
- Payment confirmation (donor and admin)
- Content published (author)
- Comment reply (original commenter)
- Question answered (asker)
- New reaction on content (author)
- Announcements (all members)

**How it works:**
1. When an event occurs (payment processed, comment posted, etc.), the notification service creates a `Notification` record in the database.
2. The service pushes the notification through the Channels layer to the user's WebSocket consumer.
3. The frontend `NotificationBell` component receives the event and updates the unread badge count in real time.
4. If the WebSocket is disconnected, the frontend periodically polls `GET /api/v1/notifications/` to catch up.
5. Users control which notification types trigger email alerts through their notification preferences.

Each user only receives their own notifications. There is no broadcast leakage. Notifications persist in the database and can be marked as read or reviewed later.

---

## Project Structure

```
church-digital-platform/
|
|-- backend/                              Django REST API (Python 3.12)
|   |-- config/                           Settings, ASGI/WSGI, URL routing, Celery config
|   |   |-- settings.py                   Django configuration (12-factor, env-based)
|   |   |-- asgi.py                       ASGI entrypoint (Daphne + Channels)
|   |   |-- wsgi.py                       WSGI entrypoint (Gunicorn)
|   |   |-- urls.py                       API route definitions
|   |   |-- celery.py                     Celery app and task discovery
|   |   +-- views.py                      ReactAppView (SPA catch-all)
|   |
|   |-- apps/
|   |   |-- users/                        Auth, profiles, JWT, Google OAuth, email verification
|   |   |-- content/                      Posts, sermons, drafts, scheduling, media, content types
|   |   |-- series/                       Sermon series management and ordering
|   |   |-- interactions/                 Comments (threaded), reactions, Q&A
|   |   |-- notifications/               WebSocket consumer, notification service, preferences
|   |   |-- payments/                     Paystack integration, webhooks, fraud detection
|   |   |-- giving/                       Giving/seed catalog
|   |   |-- payouts/                      Payout tracking
|   |   |-- email_campaigns/             Campaign CRUD, templates, Celery send tasks
|   |   |-- email/                        Transactional email service
|   |   |-- moderation/                   Flags, audit log, moderation queue
|   |   |-- analytics/                    Page views, visitor fingerprinting, metrics
|   |   |-- bible/                        Bible text module (offline-first)
|   |   +-- contact/                      Contact form + admin inbox
|   |
|   |-- tests/                            Backend test suite
|   |-- manage.py                         Django CLI
|   +-- requirements.txt                  Python dependencies
|
|-- src/                                  React frontend (TypeScript)
|   |-- public/                           Public-facing pages (Home, Library, Series, Events)
|   |-- member/                           Member dashboard (authenticated)
|   |-- admin/                            Admin dashboard (role-gated)
|   |-- auth/                             Auth context, hooks, services
|   |-- components/                       Shared UI components (editor, tables, notifications)
|   |-- services/                         API service layer (Axios wrappers)
|   |-- hooks/                            Custom hooks (useAuth, useWebSocketNotifications)
|   |-- router/                           Route definitions with role guards
|   |-- contexts/                         Auth, toast, confirm dialog contexts
|   |-- types/                            TypeScript interfaces and type definitions
|   +-- styles/                           Global CSS, Tailwind imports, design tokens
|
|-- public/                               Static assets (index.html, favicon, manifests)
|-- docker-compose.yml                    5-service orchestration (db, redis, web, celery, nginx)
|-- Dockerfile                            Multi-stage build (Node 22 -> Python 3.12-slim)
|-- nginx.conf                            Reverse proxy config (WebSocket upgrade, caching)
|-- package.json                          Frontend dependencies and scripts
|-- tailwind.config.js                    Tailwind configuration
|-- tsconfig.json                         TypeScript compiler configuration
|-- .env.example                          Frontend environment template
|-- .env.production.example               Production environment template
+-- instruction.md                        Developer guidelines and coding standards
```

---

## Getting Started

### Option A: Docker (recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

```bash
# Clone the repository
git clone https://github.com/Gidheav/church-digital-engagement-platform.git
cd church-digital-engagement-platform

# Create environment file from template
cp .env.production.example .env.production
# Edit .env.production with your actual values (see Environment Configuration below)

# Build and start all services
docker-compose up -d --build

# Run database migrations
docker-compose exec web python backend/manage.py migrate

# Create the initial admin account
docker-compose exec web python backend/manage.py createsuperuser

# Verify everything is running
docker-compose ps
```

Access points after startup:
- Public site: `http://localhost` (port 80 via Nginx) or `http://localhost:8000` (direct to Django)
- Admin login: `http://localhost/admin-auth`
- API documentation: `http://localhost/api/v1/docs/` (Swagger) or `http://localhost/api/v1/redoc/` (ReDoc)

Useful commands:
```bash
docker-compose logs -f web          # Application logs
docker-compose logs -f celery       # Background task logs
docker-compose down                 # Stop all services
docker-compose down -v              # Stop and remove volumes (destroys data)
```

### Option B: Local development (without Docker)

**Prerequisites:** Python 3.11+, Node.js 18+, PostgreSQL 14+, Redis 7+, Git

**Backend:**
```bash
cd backend
python -m venv ../venv

# Windows
..\venv\Scripts\activate
# macOS/Linux
source ../venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env
# Edit .env with database credentials, Paystack keys, SMTP config

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend available at `http://localhost:8000/api/v1/`

**Frontend** (separate terminal, from project root):
```bash
npm install
echo "REACT_APP_API_BASE_URL=http://localhost:8000/api/v1" > .env.local
npm start
```

Frontend available at `http://localhost:3000` (proxied to backend via `package.json` proxy config)

**Celery** (optional, separate terminal):
```bash
cd backend
celery -A config worker -l info --pool=threads    # Worker
celery -A config beat -l info                      # Scheduler (another terminal)
```

---

## Environment Configuration

All secrets and configuration are loaded from environment variables. Nothing is hardcoded. `.env` files are gitignored.

### Backend (`backend/.env`)

| Variable | Required | Example | Purpose |
|---|:---:|---|---|
| `SECRET_KEY` | Yes | `<50+ char random string>` | Django signing key. Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | Yes | `False` | Must be `False` in production |
| `ALLOWED_HOSTS` | Yes | `yourdomain.com,www.yourdomain.com` | Comma-separated list of valid hostnames |
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/church_db` | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379/0` | Redis connection string |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://yourdomain.com` | Frontend origins allowed to call the API |
| `EMAIL_HOST` | Yes | `smtp.gmail.com` | SMTP server |
| `EMAIL_PORT` | Yes | `587` | SMTP port (587 for TLS) |
| `EMAIL_USE_TLS` | Yes | `True` | Enable TLS |
| `EMAIL_HOST_USER` | Yes | `church@gmail.com` | SMTP account |
| `EMAIL_HOST_PASSWORD` | Yes | `<app-specific password>` | SMTP password (use app-specific password for Gmail) |
| `DEFAULT_FROM_EMAIL` | No | `noreply@yourdomain.com` | Sender address for outgoing email |
| `PAYSTACK_PUBLIC_KEY` | Yes | `pk_live_xxxxx` | Paystack public key |
| `PAYSTACK_SECRET_KEY` | Yes | `sk_live_xxxxx` | Paystack secret key |
| `PAYSTACK_WEBHOOK_SECRET` | Yes | `<random token>` | Webhook HMAC signing secret |
| `GOOGLE_CLIENT_ID` | For OAuth | `<client_id>.apps.googleusercontent.com` | Google OAuth web client ID |
| `GOOGLE_CLIENT_SECRET` | For OAuth | `GOCSPX-...` | Google OAuth client secret (backend only) |

### Frontend (`.env.local` or `.env.production` at project root)

| Variable | Required | Example | Purpose |
|---|:---:|---|---|
| `REACT_APP_API_BASE_URL` | Yes | `https://yourdomain.com/api/v1` | Backend API base URL |
| `REACT_APP_GOOGLE_CLIENT_ID` | For OAuth | `<client_id>.apps.googleusercontent.com` | Google Sign-In button client ID |
| `REACT_APP_WS_URL` | No | `wss://yourdomain.com/ws` | WebSocket URL (auto-constructed if omitted) |

### Google OAuth setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Configure the OAuth consent screen under APIs & Services.
3. Create an OAuth 2.0 Client ID (Web application type).
4. Add authorized JavaScript origins: your frontend URL(s).
5. Copy the Client ID to both `GOOGLE_CLIENT_ID` (backend) and `REACT_APP_GOOGLE_CLIENT_ID` (frontend). Copy the Client Secret to `GOOGLE_CLIENT_SECRET` (backend only, never expose to the frontend).
6. The backend verifies Google ID tokens and enforces audience match. Keep production origins HTTPS-only.

---

## API Reference

The API is fully documented through auto-generated OpenAPI 3.0 spec. When the backend is running:

- **Swagger UI:** `http://localhost:8000/api/v1/docs/` (interactive, test endpoints directly)
- **ReDoc:** `http://localhost:8000/api/v1/redoc/` (clean reference documentation)
- **Raw schema:** `http://localhost:8000/api/v1/schema/` (JSON/YAML for code generation)

All endpoints are prefixed with `/api/v1/`.

### Endpoint groups

| Group | Base Path | Auth | Description |
|---|---|---|---|
| Auth | `/api/v1/auth/` | None | Register, login, logout, token refresh, email verification, password reset |
| Admin Auth | `/api/v1/admin-auth/` | Staff+ | Staff-only login and token management |
| Public Content | `/api/v1/public/` | None | Browse posts, series, homepage data, search |
| Public Series | `/api/v1/public/` | None | Browse sermon series |
| Member Profile | `/api/v1/me/` | Member+ | Current user profile and preferences |
| Comments | `/api/v1/comments/` | Member+ (write) | Threaded comments, replies |
| Notifications | `/api/v1/notifications/` | Member+ | List, mark read, preference management |
| Payments | `/api/v1/payments/` | Member+ | Initialize donation, verify, payment history |
| Giving Items | `/api/v1/giving-items/` | Varies | Seed/giving catalog |
| Analytics | `/api/v1/analytics/` | Varies | Page view tracking, dashboard metrics |
| Contact | `/api/v1/contact/` | None (submit) | Contact form submission, admin inbox |
| Admin Content | `/api/v1/admin/content/` | Moderator+ | Content CRUD, drafts, scheduling |
| Admin Series | `/api/v1/admin/series/` | Moderator+ | Series management |
| Admin Interactions | `/api/v1/admin/interactions/` | Moderator+ | Moderation queue, comment actions |
| Admin Email | `/api/v1/admin/email/` | Admin | Campaign CRUD, send, tracking |
| Admin Moderation | `/api/v1/admin/moderation/` | Admin | Audit logs, flags, reports |
| Bible | `/api/bible/` | None | Bible text retrieval (offline-first) |

### Authentication

```bash
# Get tokens
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "yourpassword"}'

# Response: {"access": "<token>", "refresh": "<token>"}

# Use the access token
curl http://localhost:8000/api/v1/notifications/ \
  -H "Authorization: Bearer <access_token>"

# Refresh when expired (default: 60 min)
curl -X POST http://localhost:8000/api/v1/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "<refresh_token>"}'
```

### WebSocket

```
ws://localhost:8000/ws/notifications/     (development)
wss://yourdomain.com/ws/notifications/    (production)
```

Requires an authenticated session. Receives notification events in real time.

---

## Deployment

### Production with Docker Compose

```bash
# On your server
git clone https://github.com/Gidheav/church-digital-engagement-platform.git
cd church-digital-engagement-platform

cp .env.production.example .env.production
# Edit .env.production with production values

docker-compose up -d --build
docker-compose exec web python backend/manage.py migrate
docker-compose exec web python backend/manage.py collectstatic --noinput
docker-compose exec web python backend/manage.py createsuperuser
```

### Pre-deployment checklist

- [ ] `DEBUG=False` in environment
- [ ] `SECRET_KEY` is a unique, random 50+ character string (not the default)
- [ ] `ALLOWED_HOSTS` lists only your actual domain(s)
- [ ] `CORS_ALLOWED_ORIGINS` lists only your frontend origin(s)
- [ ] Database is PostgreSQL (not SQLite)
- [ ] SSL/TLS certificate configured (Let's Encrypt or equivalent)
- [ ] Nginx HTTPS redirect uncommented in `nginx.conf`
- [ ] Paystack keys are live (not test)
- [ ] Paystack webhook URL configured in Paystack dashboard
- [ ] SMTP credentials verified and tested
- [ ] `.env` files are in `.gitignore` and not committed
- [ ] Database backup schedule in place
- [ ] Firewall allows only ports 80, 443, and SSH
- [ ] Error monitoring configured (Sentry or equivalent)

### Scaling considerations

For deployments serving 10,000+ members or handling high traffic:

| Concern | Recommendation |
|---|---|
| Database | Migrate to managed PostgreSQL (AWS RDS, DigitalOcean Managed DB, or equivalent) |
| Redis | Use a managed Redis instance |
| Application servers | Run multiple Django instances behind a load balancer |
| Background tasks | Dedicate a separate machine or container for Celery workers |
| Static assets | Serve through a CDN (Cloudflare, AWS CloudFront) |
| Monitoring | Add Sentry for error tracking, Prometheus/Grafana or New Relic for performance |

---

## Security Model

### Authentication and authorization

- JWT tokens with configurable expiration (default: 60 minutes) and token rotation via refresh tokens
- Role-based access control enforced on every API endpoint through DRF permission classes
- Email verification required for new accounts before granting authenticated access
- Password hashing with Django's PBKDF2 (default: 600,000 iterations)
- Google OAuth with backend-side token verification and audience matching
- Account suspension capability (data preserved, all access denied)

### Application security

| Threat | Mitigation |
|---|---|
| SQL injection | Eliminated by exclusive use of Django ORM (no raw SQL) |
| Cross-site scripting (XSS) | User-submitted HTML sanitized through DOMPurify before rendering |
| Cross-site request forgery (CSRF) | `CsrfViewMiddleware` active on all state-changing endpoints |
| Cross-origin abuse | CORS configured to allow only specified origins (no wildcard) |
| Secret exposure | All credentials in environment variables, `.env` files gitignored |
| Unauthorized API access | JWT required for protected endpoints, role checked on every request |

### Payment security

- Webhook signature verification using HMAC SHA512 with timing-safe comparison (prevents timing attacks)
- Amount validation: backend confirms the charged amount matches the original PaymentIntent
- Pre-authorization intent expiry after 30 minutes
- Per-user and per-IP rate limiting with user-agent tracking for fraud detection
- Full audit trail of every payment event (intent creation, verification, webhook receipt, completion)
- PCI compliance: Paystack handles all card data; the platform never receives or stores raw payment credentials

### Audit trail

- Every administrative action is logged: content publish/delete, role changes, user suspension, payment events, moderation actions
- Logs include the acting user, timestamp, affected resource, and action type
- Soft deletes preserve data for audit integrity
- Audit logs are exportable for compliance purposes

### Reporting vulnerabilities

If you discover a security vulnerability:
1. Do not open a public issue.
2. Contact the development team directly.
3. Include a description of the issue, steps to reproduce, and potential impact.
4. We will investigate and issue a patch.

---

## Design Decisions

These are the guiding principles behind the architecture and codebase, and the reasoning for each:

**1. Backend is the single source of truth.**
All data, permissions, and business logic live in the API. The frontend presents data, it does not make authorization decisions. This means you can swap the frontend entirely (or build a mobile app) without reimplementing access control.

**2. Security is structural, not aspirational.**
Every endpoint has a permission class. Every user input is sanitized. Every secret is externalized. These are not "nice to haves" checked off at the end, they are preconditions enforced from the first line of code.

**3. No mock data in production code.**
Every feature connects to real data through real API calls. No hardcoded arrays, no localStorage hacks, no demo shortcuts. What runs in development runs in production.

**4. Progressive complexity.**
The platform works as a basic content site immediately after deployment. Advanced features (campaigns, audit logs, analytics, payment processing) are available but do not add complexity for churches that do not need them yet.

**5. Twelve-factor configuration.**
All environment-specific values come from environment variables. The same codebase runs in development, staging, and production without modification. Configuration is the only thing that changes between environments.

**6. Offline-first where it matters.**
The Bible module uses IndexedDB for client-side caching so it works without network access after first load. Notifications degrade gracefully from WebSocket to REST polling. The platform does not break when connectivity is unreliable.

---

## Project Status and Roadmap

### Production-ready (shipped)

| Module | Status | Notes |
|---|---|---|
| Public content browsing (posts, series, search, events) | Complete | Full-text search, category filtering, pagination |
| User registration, login, email verification, password reset | Complete | JWT + Google OAuth |
| Reactions (Like, Amen, Love, Insight, Praise) | Complete | Toggle-based, real-time count updates |
| Threaded comments and Q&A | Complete | Nested replies, moderator answers, resolution tracking |
| Member dashboard and profile management | Complete | Notification preferences, activity view |
| Admin dashboard with engagement metrics | Complete | Member count, content stats, recent activity |
| Content management (create, edit, publish, schedule, draft) | Complete | Auto-save every 30 seconds |
| Sermon series management | Complete | Drag-and-drop ordering |
| User management (roles, suspension, export) | Complete | Full RBAC |
| Comment and content moderation | Complete | Moderation queue, bulk actions |
| Custom content types | Complete | Admin-configurable |
| Audit logging | Complete | All admin actions tracked |
| Email campaigns | Complete | Templates, segmentation, scheduling, delivery tracking |
| Payment processing (Paystack) | Complete | Full pipeline with fraud detection |
| Real-time notifications (WebSocket) | Complete | With REST fallback |
| Docker deployment | Complete | Multi-stage build, health checks, Nginx |
| API documentation (OpenAPI 3.0) | Complete | Swagger + ReDoc |
| Analytics and visitor tracking | Complete | Page views, device fingerprinting |
| Bible module | Complete | Offline-first with IndexedDB cache |
| Contact form with admin inbox | Complete | Public submission, admin review |

### In progress

| Feature | Status | Details |
|---|---|---|
| Reports and analytics UI | Backend complete, frontend in development | Visual dashboards for engagement data |
| Email campaign admin UI | Backend complete, frontend in development | Full campaign management interface |
| Moderation reports UI | Backend complete, frontend in development | Visual flagged content management |

### Planned

| Feature | Priority |
|---|---|
| Small groups management | High |
| Events calendar with RSVP and capacity | High |
| Recurring donations (monthly giving) | High |
| Prayer wall | Medium |
| Volunteer management | Medium |
| Podcasting (RSS feed generation) | Low |
| Mobile application | Low |

---

## Contributing

Read [instruction.md](instruction.md) before submitting any code. It covers coding standards, naming conventions, branching strategy, commit message format, and code review criteria.

**Requirements for all contributions:**
- Zero TypeScript errors and zero ESLint warnings in frontend code
- All backend tests must pass
- New features require corresponding tests and documentation
- No hardcoded values, no mock data

**Process:**
1. Fork the repository
2. Create a feature branch from `main`: `git checkout -b feature/your-feature`
3. Implement your changes with tests
4. Confirm all tests pass locally
5. Push and open a pull request against `main`
6. Address code review feedback
7. Merge after approval

---

## License

Proprietary. Contact the project maintainers for usage rights, distribution terms, and licensing inquiries.

---

<div align="center">

**Church Digital Engagement Platform**

[Repository](https://github.com/Gidheav/church-digital-engagement-platform) · [Report a Bug](https://github.com/Gidheav/church-digital-engagement-platform/issues) · [Request a Feature](https://github.com/Gidheav/church-digital-engagement-platform/issues)

</div>
