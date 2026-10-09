# Homes Operations V2 QA

Verified locally on 9 October 2026. Branch: `revamp/v2-admin`.
Base: `9e0b5e3e1b8608e27341fd7f3d2ee318b80749cd`.
Design references: website `b0f9ce6fa5fa306e066b8a3f014d271b95e54782` and Android `4fac6f6be08a5c7ab2016bc3f1750b5b750bacba`.

## Scope and design

Homes is the primary brand; dnb appears quietly in the operations sidebar and login footer. Emerald/ivory light tokens and green-black dark tokens use compact system typography, 38–40px controls, dense records, restrained status colors, and borders instead of panel shadows. Desktop navigation is 232px wide; tablet/mobile navigation is a modal drawer.

Updated login, dashboard, inventory, grouped property editor/media management, viewing queue, inquiry inbox, agents/agencies, audit and administrators. Publishing/assignment/save form sections occupy a sticky desktop rail and become ordinary sections on mobile. The dashboard uses existing API counts only; unpublished inventory excludes published and archived listings according to the existing dashboard endpoint's count semantics.

No API endpoint or property save payload contract changed. Fixed the existing unassigned-agent agency value: `null` replaces an invalid empty object-ID string. Added decimal number input support, safe redirect rejection of backslashes/control characters, Uganda-time display, explicit queue status confirmation, image failure fallbacks, media busy/error handling, and keyboard dialog focus cycling. A failed existing-property load cannot present a blank editable form.

## Authentication and authorization

The server proxy routes, `lib/api.ts`, `lib/server-api.ts`, `lib/environment.mjs`, and `proxy.ts` are unchanged. `API_BASE_URL` remains server-only. Browser application API requests remain `/api/admin/*` and `/api/auth/login|logout`; no public backend URL or authentication token storage was introduced.

Verified through real browser UI and the existing proxy/backend:

- Normal sign-in, sign-out, reload/session restoration and invalid-session redirect.
- Missing/expired access cookie recovered through the existing refresh cookie.
- HttpOnly cookies: browser `document.cookie` does not reveal credentials. Built production app cookies retain **Secure**, host scope, existing SameSite settings and `/` path.
- Missing/cross-origin mutation Origin rejected with 403.
- Unsafe `next` redirect remains on the administrator site.
- Editor navigation includes dashboard and properties only; direct restricted pages display an access error and do not mount privileged page content.
- Editor verification/featured controls and publishing/archive options remain disabled. Direct publish/archive/feature API requests are denied; attempts to inject privileged PATCH fields are stripped by the unchanged backend.
- Admin cannot access administrators; super-admin can create accounts through the existing UI.
- API outage displays a generic error without backend diagnostic material; Retry recovers.

Production API guards, bounded upstream requests and refresh coalescing remain unchanged. No production credentials were printed or committed.

## Functional browser QA

Mutation tests ran against the existing backend source with an ephemeral loopback MongoDB, isolated demo inventory and dedicated local QA accounts. No backend source was edited and no production records were changed. The backend's original 300-request limiter stayed intact; the ephemeral QA API process was restarted between large test batches while preserving its test database.

Passed:

- Property search from page 2 resets to page 1; pagination and status filtering retain existing query fields.
- Create, edit, save, admin publication and subsequent reload persistence.
- Decimal USD price and fractional acreage persisted through the production build.
- Actual image uploads, alt text, ordering/first-image cover, remove and subsequent save/reload.
- Viewing status does not change on selection alone; Update persists it. UTC 09:30 displays as 12:30 EAT.
- Inquiry status updates, kind/status filters and readable long messages/contact addresses.
- Agent/agency creation and edit persistence, modal dismissal, and administrator creation.
- Audit records display action, actor, entity and timestamp without arbitrary metadata.

The current public Vercel login loaded and was captured read-only. Authenticated live-production QA remains unperformed because production credentials were not provided. All mutation-heavy verification used the isolated local API.

## Responsive and visual QA

Both light and dark modes were checked on nine operations routes at:

`390×844`, `430×932`, `768×1024`, `1024×768`, `1280×800`, `1440×900`, `1920×1080`.

No horizontal body overflow was found. Separately verified existing-property media layouts in both themes at all seven sizes and agent, agency and administrator dialogs at every size. System theme follows browser preference changes and survives reload. Drawer Tab/Shift-Tab cycling, Escape dismissal and focus return were verified.

Manually reviewed desktop/mobile inventory, grouped editor/media, drawer, dashboard and long-message inquiry screenshots. Corrected missing-image presentation and narrow queue buttons that could split “Update” across lines. The built app smoke test reported no hydration or page errors.

Screenshots and command logs are outside source-controlled assets:

`/home/db/WORK/dnb Homes/artifacts/v2-admin/`

Production-build captures (both `light` and `dark` suffixes):

- `prod-1440-login-{theme}.png`
- `prod-1440-dashboard-{theme}.png`
- `prod-1440-properties-{theme}.png`
- `prod-1440-editor-{theme}.png`
- `prod-1440-bookings-{theme}.png`
- `prod-1440-inquiries-{theme}.png`
- `prod-390-login-{theme}.png`
- `prod-390-dashboard-{theme}.png`
- `prod-390-properties-{theme}.png`
- `prod-390-editor-{theme}.png`
- `prod-390-navigation-{theme}.png`

Additional captures include mobile inquiries, media editors, three mobile dialogs and the existing public login. Reproducible local fixture/browser scripts are in the same external artifact directory; they generate fresh isolated credentials and do not belong in production assets.

## Validation and dependencies

Node `22.23.3`; npm `10.9.9`. Next.js and eslint-config-next are pinned to **16.4.0**. Compatible transitive updates resolve the remaining production dependency advisories. No force audit fix, dependency overrides or unrelated major upgrades were used.

| Check | Result |
|---|---|
| `npm ci` | Pass; lockfile installs successfully |
| `npm audit --omit=dev` | 0 advisories |
| `npm audit` | 5 high development findings; exit 1 |
| `npm run lint` | Pass; 0 errors, 1 warning in unchanged `lib/api.ts` full-navigation expiry handler |
| `npm run typecheck` | Pass |
| `npm test` | 6/6 pass, including existing production URL/origin guards |
| `npm run build` | Pass with public HTTPS API configuration |
| Built app smoke | Pass with explicit local profile and isolated API; Secure cookies, saved decimals and partner edits verified |
| `git diff --check` | Pass |

Remaining npm findings are **development-only**, all high: `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next`, `eslint-config-next`. These include propagation of the underlying `braces` advisory through the ESLint chain. npm's suggested downgrade is incompatible with the requested Next 16.4 configuration and was not applied. A compatible upstream fix remains necessary.

The tree confirms the exact requested versions. npm 10 additionally labels the optional `@img/sharp-wasm32` fallback extraneous on this Linux installation; it is present in the lockfile through other-platform optional Sharp packages. Clean installation and native production build succeed. React 18 remains supported but Next reports future deprecation; no unrelated React major upgrade was made.

## Release boundary

Only `revamp/v2-admin` is to be pushed. Admin main stays at the required base. Backend, website and Android source/branches are untouched. No manual deployment or production promotion is part of this work. Preview protection/authenticated production smoke should be reviewed by G/Douglas before a later merge.
