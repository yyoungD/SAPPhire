# AGENTS.md

## Project Overview

SAPPhire is a monorepo with three apps:

- `apps/client`: user-facing React/Vite app
- `apps/admin`: admin React/Vite app
- `apps/server`: Spring Boot backend

## Commands

Run commands from each app directory unless noted.

### Admin

- Install: `npm.cmd install`
- Dev: `npm.cmd run dev`
- Build: `npm.cmd run build`
- Lint: `npm.cmd run lint`

### Client

- Install: `npm.cmd install`
- Dev: `npm.cmd run dev`
- Build: `npm.cmd run build`
- Lint: `npm.cmd run lint`

### Server

- Build/test: `.\gradlew.bat build`
- Run: `.\gradlew.bat bootRun`

## Admin App Architecture

Admin app uses a custom router in:

- `apps/admin/src/routes/AppRouter.jsx`

There is no React Router currently. Navigation is handled with `window.history.pushState`
and `popstate`.

Admin pages should be rendered inside:

- `apps/admin/src/components/layout/AdminLayout.jsx`

`AdminLayout` owns:

- sidebar
- header
- shared admin background
- main content spacing

Admin pages should only render page-specific content.

### Admin Layout Structure

```txt
AdminLayout
  ├─ AdminSidebar
  ├─ AdminHeader
  └─ main
      └─ current page
```

## Admin Pages

Use this pattern:

apps/admin/src/pages/
AdminDashboardPage.jsx
users/
AdminUserManagePage.jsx
AdminUserDetailPage.jsx
AdminUserEditPage.jsx
Do not import AdminLayout, AdminHeader, or AdminSidebar inside individual admin pages.
The router wraps admin pages with layout.

Routing Rules
Admin route constants live in:

apps/admin/src/constanjs/routes.js
When adding an admin page:

Add a route constant to ROUTES
Add the page component under apps/admin/src/pages
Add the route mapping in AppRouter.jsx
Add sidebar navigation only if it is a primary admin menu
Example:

[ROUTES.ADMIN_USERS]: <AdminUserManagePage />

Naming Rules
Use these names for admin pages:

Main management page: Admin{Domain}ManagePage.jsx
Detail page: Admin{Domain}DetailPage.jsx
Edit page: Admin{Domain}EditPage.jsx
Examples:

AdminUserManagePage.jsx
AdminCompanyManagePage.jsx
AdminJobDetailPage.jsx
Avoid naming a management dashboard page ListPage when it includes summary cards,
filters, actions, and a table.

Component Placement
Shared admin layout components:

apps/admin/src/components/layout/
Domain-specific page components:

apps/admin/src/pages/{domain}/components/
Example:

apps/admin/src/pages/users/components/UserTable.jsx
Only move a component to src/components when it is reused across multiple domains.

Style Guidelines
Use existing Tailwind utility style.
Keep admin UI dense and operational.
Use lucide-react icons for admin buttons and menu items.
Do not duplicate sidebar/header markup inside pages.
Keep cards at rounded-lg or less.
Encoding Note
Some earlier files may show broken Korean text in terminal output depending on console encoding.
When editing user-facing Korean text, preserve clean UTF-8 Korean strings.

Git Safety
Do not reset or revert unrelated changes.
Check git status --short before summarizing edits.
Keep commits scoped by app or feature.

```

```
