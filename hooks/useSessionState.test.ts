import { beforeEach, describe, expect, it } from 'vitest';
import { clearLegacySessionLocalStorage, shouldRefreshSessionsAfterStorageCleanup } from './useSessionState';

describe('session storage cleanup refresh policy', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key)
      }
    });
  });

  it('does not refresh sessions when cleanup did not delete image records', () => {
    expect(shouldRefreshSessionsAfterStorageCleanup({ deletedImageIds: [] })).toBe(false);
  });

  it('refreshes sessions after cleanup deletes image records', () => {
    expect(shouldRefreshSessionsAfterStorageCleanup({ deletedImageIds: ['failed-image-1'] })).toBe(true);
  });

  it('clears legacy localStorage data after IndexedDB is authoritative', () => {
    localStorage.setItem('banana-batch-sessions', JSON.stringify([{ id: 'legacy-session' }]));
    localStorage.setItem('banana-batch-current-session', 'legacy-session');

    clearLegacySessionLocalStorage();

    expect(localStorage.getItem('banana-batch-sessions')).toBeNull();
    expect(localStorage.getItem('banana-batch-current-session')).toBeNull();
  });
});
