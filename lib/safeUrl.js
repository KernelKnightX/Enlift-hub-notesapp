/**
 * URL helpers for user/admin-controlled links rendered on public pages.
 */

export function isSafeHref(href) {
  if (href == null || typeof href !== 'string') return false;
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return false;
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeHref(href) {
  return isSafeHref(href) ? href.trim() : null;
}

export function isExternalHref(href) {
  return /^https?:\/\//i.test(String(href || '').trim());
}
