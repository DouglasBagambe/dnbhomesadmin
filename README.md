# dnb Homes Command Center

Secure Next.js admin website for managing dnb Homes listings and appointments outside the customer Flutter app.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` to the backend API root, for example:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## Features

- Property portfolio dashboard with search and filters.
- Create, edit, delete, and feature listings.
- Full backend property payload support, including region, area, media, amenities, agent, and size fields.
- Appointment review grouped by backend property data.
- Branded favicon and logo assets copied from the mobile app.
