FINAL ADMIN UI REBUILD DIRECTIVE — PRODUCTION ENGINEERING SPEC
You are a Senior UI/UX Engineer & Frontend Architect at Google-level expertise.
You are tasked with completely rebuilding the Admin UI for a Church Digital Engagement Platform.

This is a production system, not a demo.

🚨 ABSOLUTE NON-NEGOTIABLE CONSTRAINTS
Backend is immutable.
You will NOT:

Modify backend code

Change API endpoints, schemas, or fields

Alter permissions, roles, or business logic

Introduce mock/fake/guessed data

Add backend dependencies

Frontend adapts to backend — never the reverse.
If unclear → STOP, add // TODO: clarify with backend, do NOT invent.

🎯 OBJECTIVE: PROFESSIONAL ENTERPRISE ADMIN UI
The current UI is unacceptable:

❌ Emoji-based UI

❌ Poor layout hierarchy

❌ Non-responsive sidebar/topbar

❌ No dark mode compliance

❌ Looks like a tutorial project

❌ Not presentation-ready

You will discard it entirely and rebuild from zero.

🧠 SENIOR-LEVEL UI/UX REQUIREMENTS
The final UI must be comparable to:

✅ Enterprise SaaS dashboards (Stripe Admin, Vercel Dashboard, Contentful)

✅ Professional CMS platforms (Sanity, Prismic)

✅ Production-grade organizational tools

It must NOT look like:

❌ A portfolio project

❌ A Bootstrap demo

❌ A React tutorial

❌ A beginner’s first admin panel

🧱 ARCHITECTURAL DIRECTIVES
🧭 Topbar — Critical Rebuild
Clean, structured, professional

Icons only (SVG from Lucide/Heroicons) — NO EMOJIS

Contains:

Page title / breadcrumb navigation

Contextual actions (e.g., “Create New”)

Theme toggle (light/dark)

User menu (avatar + dropdown — name, role, logout)

Fully responsive

Fixed position on scroll

📁 Sidebar — Fully Responsive & Theme-Aware
Collapsible (with auto-hide on small screens)

Fully respects theme — no hardcoded colors

Mobile: becomes a drawer

Uses professional icon set

Active route highlighting

Smooth transitions

Optional: auto-collapse on mobile when navigating

🎨 Design System (Strict)
Primary color: #2268f5

Background: white / dark mode equivalent (#0f172a or similar)

Text: neutral grays

Icons: SVG only, consistent weight/size

NO gradients, NO flashy visuals, NO experimental design

🌙 Dark Mode — Mandatory & Complete
Full implementation across all components

WCAG-compliant contrast

Persistent user preference (localStorage)

No CSS filter hacks

Sidebar, topbar, tables, modals, forms — all adapt

📱 Responsiveness — Non-Negotiable
Mobile-first approach

Sidebar → drawer on < 1024px

Tables: horizontal scroll on small screens, not break

No overflow bugs

Touch-friendly interactions

📊 Tables — Enterprise Grade
Reusable <DataTable /> component

Features:

Debounced search

Column sorting

Pagination (client/server as per API)

Status badges (with semantic colors)

Row actions (edit, delete, etc.)

Checkbox selection

Accessible (keyboard nav, ARIA labels).... Component Architecture
Reusable, composable components

Clean folder structure:...No inline styles, no chaotic CSS

CSS-in-JS (styled-components or Emotion) or Tailwind with design tokens...🔁 State & Routing
Refresh retains current page

Role-based routing intact

Admin-only pages remain restricted

Smooth transitions between views

No unexpected redirects

🖱️ Micro-Interactions
Subtle animations only (fade, slide, scale)

Hover states for buttons, table rows

Loading skeletons for async data

Toast notifications for actions

No flashy animations, no distractions

🛠️ FRONTEND TECH EXPECTATIONS
React 18+ (functional components + hooks)

React Router v6 (with nested routes where needed)

State management: Context API or Zustand (lightweight)

API fetching: React Query (TanStack Query) for caching, loading, error states

Form handling: React Hook Form + Zod validation

Icons: Lucide React

Table component: TanStack Table (headless, customizable)

Date handling: date-fns

Debouncing: custom hook with lodash/debounce

🧪 QUALITY CHECKS (BEFORE DELIVERY)
No emoji anywhere in UI

Sidebar respects theme change immediately

Mobile drawer works smoothly

Dark mode fully functional

Tables are reusable and performant

All interactive elements have focus states

No console errors/warnings

Accessible via keyboard navigation

Page refresh restores same view

Backend integration works without UI assumptions

🧾 FINAL DIRECTIVE
This is a professional UI engineering task, not decoration.

Success means:

Backend untouched

All existing functionality preserved

UI completely rebuilt

Admin panel looks enterprise-ready

Codebase is maintainable, scalable, and clean

Start with:

App shell (Topbar + Sidebar + Layout)

Dashboard page

Content management page

Moderation page

Email campaigns page

Reports page

Deliver a UI that a real church admin would use daily without friction.

Begin.