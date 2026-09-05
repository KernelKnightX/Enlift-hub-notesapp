const SESSION_PREFIX = 'mock-session';

function sessionKey(testId, userId) {
  return `${SESSION_PREFIX}:${userId || 'guest'}:${testId}`;
}

export function loadMockSession(testId, userId) {
  if (typeof window === 'undefined' || !testId) return null;
  try {
    const raw = window.localStorage.getItem(sessionKey(testId, userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt) return null;
    // Expire after 24 hours
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      clearMockSession(testId, userId);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveMockSession(testId, userId, payload) {
  if (typeof window === 'undefined' || !testId) return;
  try {
    window.localStorage.setItem(
      sessionKey(testId, userId),
      JSON.stringify({ ...payload, savedAt: Date.now() }),
    );
  } catch {
    // Ignore quota errors
  }
}

export function clearMockSession(testId, userId) {
  if (typeof window === 'undefined' || !testId) return;
  try {
    window.localStorage.removeItem(sessionKey(testId, userId));
  } catch {
    // ignore
  }
}
