import { useEffect, useState } from 'react';
import { createSelfieSignedUrl } from '@/utils/selfie';

/**
 * Resolve a displayable selfie URL for authenticated dashboard views.
 * Returns '' while loading or on failure (caller should fall back to avatar).
 */
export const useSignedSelfieUrl = (selfieUrl) => {
  const [signedUrl, setSignedUrl] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!selfieUrl) {
      setSignedUrl('');
      return undefined;
    }

    setSignedUrl('');

    createSelfieSignedUrl(selfieUrl).then((url) => {
      if (!cancelled) {
        setSignedUrl(url || '');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selfieUrl]);

  return signedUrl;
};
