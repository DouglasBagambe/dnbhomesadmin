export const MAX_MEDIA = 40;
const MB = 1024 * 1024;
const allowed = new Set(['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm']);
export function mediaBatches(files, existingCount = 0) {
  if (files.length + existingCount > MAX_MEDIA) throw new Error('A property supports at most 40 media items.');
  const batches = []; let batch = [], bytes = 0;
  for (const file of files) {
    if (!allowed.has(file.type)) throw new Error(`Unsupported format: ${file.name}`);
    const maximum = file.type.startsWith('image/') ? 10 * MB : 50 * MB;
    if (file.size > maximum) throw new Error(`${file.name} exceeds the ${maximum / MB} MB file limit.`);
    if (batch.length === 10 || bytes + file.size > 100 * MB) { batches.push(batch); batch = []; bytes = 0; }
    batch.push(file); bytes += file.size;
  }
  if (batch.length) batches.push(batch);
  return batches;
}
