export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const REPORT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp';
export const REPORT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const MAX_NOTES_LENGTH = 2000;

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
