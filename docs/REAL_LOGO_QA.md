# Supplied-logo and showcase inventory QA

9 October 2026, branch `brand/real-logo`, base main
`70a8dc331e5e4e74592ea09fed789b0136760ef4`.

The login, desktop sidebar and mobile drawer use the supplied
`public/brand/logo-light.svg` / `logo-dark.svg` mark without altering its artwork
or aspect ratio. Actual asset colors were inspected; CSS chooses the dark mark
on light surfaces and pale mark on dark surfaces. HOMES remains dominant and
Operations secondary. Missing media uses a neutral dash rather than a temporary
H-dot brand. Auth, roles, API contracts, queue actions and production guards are
unchanged.

Fresh npm ci, lint (one existing full-page auth navigation warning), typecheck,
six unit tests and public-HTTPS production build passed. Local production UI
against the authorized public preview backend was signed into with an existing
administrator, without changing credentials or roles. Properties reported 50
records; light/dark inventory thumbnails, sidebar mark and mobile drawer were
visually inspected. No records were recreated through Admin. Screenshots and
QA evidence are outside product source in `artifacts/showcase-real-logo/`.

Preview photos currently use Render ephemeral media storage. Durable media
storage is required before launch; production guards were not weakened.
