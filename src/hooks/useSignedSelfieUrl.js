import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getCachedSelfieSignedUrl } from '@/utils/selfie';

/** Prefetch signed URLs slightly before the card enters the viewport. */
const DEFAULT_ROOT_MARGIN = '320px 0px';

/**
 * Resolve a displayable selfie URL for authenticated dashboard views.
 * Returns '' while waiting / on failure (caller should fall back to avatar).
 *
 * @param {string|null|undefined} selfieUrl Storage path or legacy URL from members.selfie_url
 * @param {{ lazy?: boolean, rootMargin?: string }} [options]
 *   - lazy (default true): wait until `ref` is near/in viewport before signing
 *   - lazy false: sign immediately (member detail card)
 * @returns {{ signedUrl: string, ref: React.RefObject<HTMLElement|null> }}
 */
export const useSignedSelfieUrl = (
  selfieUrl,
  { lazy = true, rootMargin = DEFAULT_ROOT_MARGIN } = {},
) => {
  const observeRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(!lazy);
  const [signedUrl, setSignedUrl] = useState('');

  useLayoutEffect(() => {
    if (!lazy) {
      setIsNearViewport(true);
      return undefined;
    }

    setIsNearViewport(false);

    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return undefined;
    }

    let cancelled = false;
    let observer = null;
    let rafId = 0;

    const observe = (node) => {
      if (cancelled || !node) {
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setIsNearViewport(true);
            observer?.disconnect();
          }
        },
        { root: null, rootMargin, threshold: 0.01 },
      );
      observer.observe(node);
    };

    const node = observeRef.current;
    if (node) {
      observe(node);
    } else {
      // Callback refs may land just after this layout pass — retry once.
      rafId = window.requestAnimationFrame(() => {
        observe(observeRef.current);
      });
    }

    return () => {
      cancelled = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      observer?.disconnect();
    };
  }, [lazy, rootMargin, selfieUrl]);

  useEffect(() => {
    let cancelled = false;

    if (!selfieUrl) {
      setSignedUrl('');
      return undefined;
    }

    if (!isNearViewport) {
      setSignedUrl('');
      return undefined;
    }

    getCachedSelfieSignedUrl(selfieUrl).then((url) => {
      if (!cancelled) {
        setSignedUrl(url || '');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selfieUrl, isNearViewport]);

  return { signedUrl, ref: observeRef };
};
