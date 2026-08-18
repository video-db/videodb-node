/** Browser counterpart of `openBrowser`, selected via package.json's `browser` field. */
export const openBrowser = (url: string): boolean => {
  if (typeof window === 'undefined' || typeof window.open !== 'function') {
    return false;
  }
  return window.open(url, '_blank', 'noopener,noreferrer') !== null;
};
