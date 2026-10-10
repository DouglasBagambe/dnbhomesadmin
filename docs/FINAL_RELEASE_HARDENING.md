# Final release hardening

Select 20 images + 5 videos once. The editor validates the complete selection and property maximum (40), then uploads sequential batches of at most 10 files and 100 MiB. Images are JPEG/PNG/WebP/AVIF up to 10 MiB; videos MP4/WebM up to 50 MiB. Overall progress counts completed files. If a later batch fails, previous completed media remain visible, and Retry uploads only the remaining selection. Discarding the remaining selection leaves successful media available for saving.

Image thumbnails and native video players retain alt text. Media support drag ordering, direct position entry and Up/Down keyboard-accessible buttons. The first image is the cover even when a video comes first; exact order and alt text persist on reopen. Newly uploaded asset removal uses the existing delete endpoint; saved property media removal updates references. Saving no images clears the stale cover through the matching backend update.

Uploads do not proxy binary bodies through Vercel Functions (4.5 MB body limit). A same-origin authenticated Admin proxy requests a short-lived, single-use origin-bound upload capability; only this scoped token reaches the browser. Admin access/refresh JWTs remain in HttpOnly cookies. Uploads go directly to the configured API, credentials omitted, with X-Media-Upload-Token. Existing roles, cookie rotation, exact CORS and same-origin checks remain intact. Deploy the matching backend before this UI, and approve only the exact preview origin in backend CORS.

Hosted media QA reuses 6aca1225ca3d4ce6f2209da4 in homes_preview, unverified and clearly labelled synthetic QA. Normal Render local uploads remain ephemeral; production launch requires S3/R2-compatible storage credentials. No production deployment or infrastructure migration is part of this branch.

Validation: npm ci, lint, typecheck, npm test, build, git diff --check. Local browser QA covers selecting 25 once, deliberate partial failure, preserving 10 completed files, retrying 15, order/cover/alt persistence, mobile dimensions and deleting a disposable extra asset.
