# REKÒ — Digital Museum of Nigerian History

REKÒ helps people explore Nigerian history, culture, and the stories shaping the present. It is designed around discovery and context: visitors can move between exhibitions, experiences, stories, people, places, events, and artifacts to understand how they connect.

> **Status:** In development; no public deployment yet.

## Product experience

- **Explore:** Discover exhibitions, experiences, stories, people, places, events, and artifacts.
- **Exhibitions and stories:** Read historical content and follow connections between related subjects.
- **Accounts:** Sign-up, email verification, sign-in, password recovery, profile, and account settings.
- **Learning tools:** Bookmarks, notes, and progress-related account areas.
- **Content administration:** Protected admin interfaces for exhibitions, stories, and related content.
- **Immersive objects:** Three.js / React Three Fiber presentation for selected objects.
- **Navigation and search:** Search, routing, protected pages, and not-found handling.

## Stack

- React 19, TypeScript, and Vite
- React Router
- Tailwind CSS 4
- Three.js, React Three Fiber, and Drei
- GSAP and Framer Motion
- Vitest and React Testing Library

## Related repository

The companion [REKÒ Backend](https://github.com/NemoCode-3011/Rekonekt-Backend) provides the Express/TypeScript API, PostgreSQL data layer, Redis support, authentication, content-management routes, and OpenAPI documentation.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Available scripts:

```bash
npm run build
npm run lint
npm test
```

For API-backed features, configure and run the backend first. Follow the backend README for its environment variables, database setup, and API documentation. Set the frontend API URL using the API client's configuration.

## Verification

The project author has tested the connected authentication, data persistence, media-upload, and admin workflows.

## Deployment and media

REKÒ is not publicly deployed yet, so there is no public demo link at this time. Screenshots and a live demo link can be added here when a deployment is available.

## Author

Built by [NemoCode-3011](https://github.com/NemoCode-3011).
