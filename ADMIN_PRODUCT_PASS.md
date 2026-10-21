# Admin product pass

This pass adds compact property filters/sorting and seven confirmed bulk actions; sectioned editing with coordinates, active agent/agency consistency, media progress and cover/reorder/alt controls; safe archive/restore and super-admin-only two-step permanent deletion; richer partner, viewing, inquiry, administrator and audit operations; real dashboard work queues; and unsaved-change protection for navigation, Back and reload/close.

Media uses authenticated, short-lived single-use upload tickets and direct backend uploads. Successful earlier batches remain in the editor after later failures. Errors identify safe stages (ticket, network, response, storage) without logging tokens or credentials. The backend media health endpoint warns when durable storage is unavailable.

Validation: lint, TypeScript, Node tests and production build. Isolated browser QA covers property creation/editing/publish/archive/restore, media upload/save, deletion confirmations, bulk verification, agent/agency autofill, viewing details/notes/status warnings, inquiry notes, audit filters/details, administrator suspension/reactivation, unsaved Back/cancel/discard and keyboard dialog focus trapping. Responsive dimensions: 390×844, 430×932, 768×1024, 1024×768, 1440×900 and 1920×1080, light and dark. Screenshots and measurements are delivered separately; synthetic QA records never use hosted customer inventory.

No Website, Flutter, consumer account or Grid/Swipe implementation is included. The Website's public media hostname allowlist may require a deployment configuration update for the R2 domain. No dependency upgrade or destructive migration is included. Hosted storage is not declared verified until upload/save/public GET/restart survival checks pass.

See Backend `ADMIN_OPERATIONS.md` for deletion history, cleanup retry policy, role enforcement and storage deployment requirements.
