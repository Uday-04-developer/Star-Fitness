import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'member-selfies';
const BUCKET_MARKER = `/${BUCKET}/`;

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
 */
export const createSelfieSignedUrl = async (
  selfieUrl,
  expiresInSeconds = 3600,
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
