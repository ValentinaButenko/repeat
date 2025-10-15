import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translate } from './translation';

describe('translation provider', () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch!; });
  it('returns empty string on error after retry', async () => {
    const mock = vi.fn()
      // @ts-expect-error - Mocking fetch response for testing error handling
      .mockResolvedValueOnce({ ok: false, status: 500 })
      // @ts-expect-error - Mocking fetch response for testing retry logic
      .mockResolvedValueOnce({ ok: false, status: 429 });
    // @ts-expect-error - Mocking global fetch for testing
    global.fetch = mock;
    const r = await translate('hola', 'es', 'en', 'https://example.com');
    expect(r).toBe('');
  });
});


