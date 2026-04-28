import { describe, expect, it } from 'vitest';
import { MESSAGE_LIST_CONTAINER_CLASS } from './MessageList';

describe('MessageList layout classes', () => {
  it('keeps the scroll area shrinkable and below the input composer layer', () => {
    expect(MESSAGE_LIST_CONTAINER_CLASS).toContain('min-h-0');
    expect(MESSAGE_LIST_CONTAINER_CLASS).toContain('relative');
    expect(MESSAGE_LIST_CONTAINER_CLASS).toContain('z-0');
    expect(MESSAGE_LIST_CONTAINER_CLASS).toContain('overflow-y-auto');
  });
});
