# dnb Homes operations

Protected Next.js administration for listings, agents, agencies, viewing requests, media, audit history, and role-scoped administrators.

Copy `.env.example` to `.env.local`, set `API_BASE_URL` to the Homes API `/api/v1` root, install dependencies, and run `npm run dev`. Authentication tokens are held in HTTP-only cookies by the Next.js server proxy rather than browser storage.

Validation commands: `npm run lint`, `npm run typecheck`, and `npm run build`.
