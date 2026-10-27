# REKÒ — Digital Museum of Nigerian History

REKÒ is a digital museum experience designed to help people explore Nigerian history, culture, and the stories that shape the present. The frontend brings historical content into an experience built around discovery, exhibitions, people, places, events, and artifacts.

> **Project status:** In development. The application is not currently deployed publicly.

## What the frontend includes

- **Discovery and exploration:** Explore pages for exhibitions, experiences, stories, people, places, events, and artifacts.
- **Exhibition and story pages:** Dedicated routes for viewing historical content and its connections.
- **Accounts:** Sign-up, email verification, sign-in, password recovery, profile, and account settings flows.
- **Personal learning tools:** Bookmarks, notes, and progress-related account areas.
- **Content administration:** Protected admin routes and interfaces for managing exhibitions, stories, and related content.
- **Immersive presentation:** A React Three Fiber / Three.js object-viewing experience alongside motion and interaction details.
- **Search and navigation:** Search, route handling, protected pages, and not-found handling.

## Frontend stack

- React 19 and TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Three.js, React Three Fiber, and Drei
- GSAP and Framer Motion
- Vitest and React Testing Library

## Related repository

The API and data layer live in the companion repository:

- [REKÒ Backend](https://github.com/NemoCode-3011/Rekonekt-Backend) — Express and TypeScript API with PostgreSQL, Redis, authentication, content-management routes, and OpenAPI documentation.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run build
npm run lint
npm test
```

The frontend expects the backend to be configured and running for API-backed features. See the backend README for its environment variables, database setup, and API documentation. Configure the frontend API URL according to the API client configuration before testing connected flows.

## Current limitations

- The project has not been deployed publicly yet.
- Connected features depend on the companion API and local environment being configured correctly.
- A public demo link and verified screenshots will be added when a deployment is available.

## Author

Built by [NemoCode-3011](https://github.com/NemoCode-3011).