import type { Media } from "./types";
export class MediaUploadError extends Error {
  safeMessage: boolean;
}
export function uploadMediaBatch(
  files: File[],
  options: {
    issueTicket: () => Promise<{ token: string; uploadUrl: string }>;
    fetcher?: typeof fetch;
    timeoutMs?: number;
  },
): Promise<Media[]>;
