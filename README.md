# dnb Homes operations

Protected Next.js administration for listings, agents, agencies, viewing requests, contact/onboarding inquiries, media, audit history, and role-scoped administrators.

Copy `.env.example` to `.env.local`, set `API_BASE_URL` to the Homes API `/api/v1` root, install dependencies, and run `npm run dev` on port 3002. Authentication tokens are held in HTTP-only cookies by the Next.js server proxy rather than browser storage. Every operations route, including inquiries, is protected by the cookie gate; API mutations remain role-authorized by the backend.

Validation commands: `npm run lint`, `npm run typecheck`, and `npm run build`.


Use Node.js 22 (CI: 22.23.3), `npm ci`, and the committed lockfile. Use `.env.production.example` as the production input checklist. Production builds/startup require explicit `API_BASE_URL` with a public HTTPS endpoint; localhost and example/invalid hosts fail closed. Keep this variable server-only. For local build checks, use `HOMES_BUILD_PROFILE=local npm run build` and the same profile when starting the built server; this permits loopback URLs only and is never deployable. Set the API URL before building and starting.

Deploy Admin behind HTTPS. Cookies remain HTTP-only, Secure in production, host-scoped, and SameSite. Login responses contain administrator identity only; tokens never enter browser JavaScript. Cookie-authenticated mutations require an exact same-origin header. The reverse proxy must preserve the external request origin/Host and must not rewrite it to an internal hostname. The backend's `TRUST_PROXY` must match its actual trusted ingress topology; do not guess hop counts or publicly expose a bypass around that ingress.

Admin checks the current session before rendering operations and hides role-inaccessible pages and protected property controls. Backend authorization remains authoritative, including editors' exclusion from private inquiries/bookings. API timeouts show a retryable error. Validate with lint, typecheck, `npm test`, build, and the workspace browser flows (login/session refresh/logout, property lifecycle, and viewing requests).

Concurrent refresh requests are coalesced within one Admin server process. Use one Admin instance for V1; before horizontal scaling validate session rotation across replicas (or provide session affinity). Backend refresh tokens are single-use even under concurrent requests.
