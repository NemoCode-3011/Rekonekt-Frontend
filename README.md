# REKÒ — Digital Museum of Nigerian History

REKÒ helps people explore Nigerian history, culture, and the stories shaping the present. Visitors can discover exhibitions, experiences, stories, people, places, events, and artifacts, and follow the connections between them.

## Features

- Browse exhibitions, stories, people, places, events, and artifacts.
- Create an account, verify an email address, sign in, and manage account settings.
- Use bookmarks, notes, and learning progress features.
- Manage museum content through protected admin pages.
- Explore selected objects through interactive 3D experiences.
- Search and navigate the museum across responsive layouts.


## Tech stack

- React 19, TypeScript, and Vite
- React Router and Axios
- Tailwind CSS 4
- Three.js, React Three Fiber, and Drei
- GSAP and Framer Motion
- Vitest and React Testing Library

## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- The companion backend for API-backed features

## Getting started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root and configure the backend API URL:

```dotenv
VITE_API_URL=https://your-backend-origin
```

Google sign-in is optional. To enable its button, also set the Google OAuth client ID:

```dotenv
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

All `VITE_` variables are included in the browser build; do not put secrets in them.

Start the development server:

```bash
npm run dev
```

## Authentication and backend

The frontend uses the companion [REKÒ Backend](https://github.com/NemoCode-3011/Rekonekt-Backend). Sign-in is based on a server session and an HttpOnly cookie; browser API requests include credentials, and the app checks `/auth/me` to resolve the current user. The frontend does not store a JWT for authentication.

Follow the backend README for its environment variables, database setup, and API documentation. Configure the backend's allowed client origin to match the frontend's exact origin. Cross-site session cookies require HTTPS and the appropriate backend cookie settings.

## Development scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and create a production build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
npm test         # Run the Vitest test suite
```


## Project structure

- `src/pages/` — route-level pages
- `src/features/` — feature modules such as auth, admin, bookmarks, and search
- `src/components/` — shared UI and navigation
- `src/layouts/` — shared page layouts
- `src/services/api/` — API client configuration


## Related project

The [REKÒ Backend](https://github.com/NemoCode-3011/Rekonekt-Backend) provides the API and data services used by this frontend.
