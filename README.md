# dnb Homes operations

Protected Next.js administration for listings, agents, agencies, viewing requests, contact/onboarding inquiries, media, audit history, and role-scoped administrators.

Copy `.env.example` to `.env.local`, set `API_BASE_URL` to the Homes API `/api/v1` root, install dependencies, and run `npm run dev` on port 3002. Authentication tokens are held in HTTP-only cookies by the Next.js server proxy rather than browser storage. Every operations route, including inquiries, is protected by the cookie gate; API mutations remain role-authorized by the backend.

Validation commands: `npm run lint`, `npm run typecheck`, and `npm run build`.
