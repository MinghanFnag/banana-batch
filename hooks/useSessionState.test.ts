import { describe, expect, it } from 'vitest';
import { shouldRefreshSessionsAfterStorageCleanup } from './useSessionState';

describe('session storage cleanup refresh policy', () => {
  it('does not refresh sessions when cleanup did not delete image records', () => {
    expect(shouldRefreshSessionsAfterStorageCleanup({ deletedImageIds: [] })).toBe(false);
  });

  it('refreshes sessions after cleanup deletes image records', () => {
    expect(shouldRefreshSessionsAfterStorageCleanup({ deletedImageIds: ['failed-image-1'] })).toBe(true);
  });
});
