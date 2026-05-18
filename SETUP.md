# Recovery Frontend

React 19 + Chakra UI on the Horizon UI theme. Wired to the recovery backend.

## Setup

```bash
npm install
npm start    # http://localhost:3000
```

Make sure the backend is running on `http://localhost:4000` (or change `REACT_APP_API_URL` in `.env`).

## Architecture

- **`src/services/`** — axios client (`api.js`) with JWT access/refresh interceptor, plus typed-ish service modules (`auth`, `users`, `roles`, `permissions`).
- **`src/context/AuthContext.js`** — auth state + `can()` permission check, hydrates from `/auth/me` on boot.
- **`src/guards/`** — `RequireAuth` (with optional `permission` prop) and `GuestRoute`.
- **`src/hooks/`** — small UI hooks (`useApiError`).
- **`src/views/`** — page components. Auth views are guarded so signed-in users skip them.
- **`src/routes.js`** — single source of truth for sidebar + admin routes. Each entry can declare `permission`, `hidden`, and `showInSidebar`.

State and data:
- React Query for server state (`useQuery`/`useMutation`)
- React Hook Form + Chakra `FormControl` for forms
- `react-hot-toast` for feedback

## Default admin

Sign in with the seeded super-admin:
- email: `admin@recovery.local`
- password: `Admin@12345`

## Sidebar

- Dashboard
- Users (permission `users.view`)
- Roles (permission `roles.view`)
- Permissions (permission `permissions.view`)

Items are filtered automatically based on the signed-in user's permissions.
