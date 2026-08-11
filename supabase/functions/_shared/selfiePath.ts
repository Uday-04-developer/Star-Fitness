const BUCKET = 'member-selfies';
const BUCKET_MARKER = `/${BUCKET}/`;

/**
 * Normalize members.selfie_url to a Storage object path.
 * Supports legacy full public URLs and path-only values.
 */
export const getSelfieObjectPath = (selfieUrl: string | null | undefined) => {
  if (!selfieUrl) {
    return null;
  }

  const value = String(selfieUrl).trim();
  if (!value) {
    return null;
  }

  const markerIndex = value.indexOf(BUCKET_MARKER);
  if (markerIndex !== -1) {
    return decodeURIComponent(
      value.slice(markerIndex + BUCKET_MARKER.length).split('?')[0],
    );
  }

  if (value.includes('://')) {
    return null;
  }

  return value.replace(/^\//, '');
};

/**
 * Flat object key only — no traversal, no nested paths, no other buckets.
 */
export const isSafeSelfieObjectPath = (path: string | null | undefined) => {
  if (!path || typeof path !== 'string') {
    return false;
  }

  const normalized = path.trim();
  if (!normalized) {
    return false;
  }

  if (
    normalized.includes('..') ||
    normalized.includes('\\') ||
    normalized.startsWith('/') ||
    normalized.includes('\0') ||
    normalized.includes('/')
  ) {
    return false;
  }

  // Expected convention: "{uuid}.jpg"
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/i.test(
    normalized,
  )) {
    // Allow legacy non-uuid flat names that are still single-segment .jpg keys
    if (!/^[A-Za-z0-9._-]+\.jpe?g$/i.test(normalized)) {
      return false;
    }
  }

  return true;
};
