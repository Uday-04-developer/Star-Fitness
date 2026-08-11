import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'member-selfies';
const BUCKET_MARKER = `/${BUCKET}/`;

/** Default signed URL lifetime for dashboard display. */
export const SELFIE_SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Refresh before hard expiry so a cached URL is not served after Storage rejects it.
 */
const CACHE_REFRESH_MARGIN_MS = 60_000;

/** path → { url, expiresAtMs } — memory only; never persist to DB/localStorage. */
const signedUrlCache = new Map();

/** path → in-flight Promise — dedupe concurrent sign requests for the same object. */
const inflightSignedUrl = new Map();

/**
 * Normalize members.selfie_url to a Storage object path.
 * Supports legacy full public URLs and new path-only values.
 */
export const getSelfieObjectPath = (selfieUrl) => {
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

  // Path-only (e.g. "uuid.jpg") — reject other absolute URLs we cannot map.
  if (value.includes('://')) {
    return null;
  }

  return value.replace(/^\//, '');
};

/**
 * Create a time-limited signed URL for an authenticated dashboard session.
 * Never call this with the service_role key — session anon/authenticated JWT only.
 * Does not read/write the in-memory cache (backup uses short TTLs separately).
 */
export const createSelfieSignedUrl = async (
  selfieUrl,
  expiresInSeconds = SELFIE_SIGNED_URL_TTL_SECONDS,
) => {
  const path = getSelfieObjectPath(selfieUrl);
  if (!path) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error(error);
    return null;
  }

  return data?.signedUrl || null;
};

const getFreshCachedUrl = (path) => {
  const entry = signedUrlCache.get(path);
  if (!entry?.url) {
    return null;
  }
  if (entry.expiresAtMs - Date.now() <= CACHE_REFRESH_MARGIN_MS) {
    signedUrlCache.delete(path);
    return null;
  }
  return entry.url;
};

/**
 * Dashboard helper: return a signed URL from memory cache or create one.
 * Concurrent callers for the same path share one Storage request.
 */
export const getCachedSelfieSignedUrl = async (
  selfieUrl,
  expiresInSeconds = SELFIE_SIGNED_URL_TTL_SECONDS,
) => {
  const path = getSelfieObjectPath(selfieUrl);
  if (!path) {
    return null;
  }

  const cached = getFreshCachedUrl(path);
  if (cached) {
    return cached;
  }

  const pending = inflightSignedUrl.get(path);
  if (pending) {
    return pending;
  }

  const request = createSelfieSignedUrl(selfieUrl, expiresInSeconds)
    .then((url) => {
      if (url) {
        signedUrlCache.set(path, {
          url,
          expiresAtMs: Date.now() + expiresInSeconds * 1000,
        });
      }
      return url;
    })
    .finally(() => {
      inflightSignedUrl.delete(path);
    });

  inflightSignedUrl.set(path, request);
  return request;
};
