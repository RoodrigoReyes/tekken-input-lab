import { describe, expect, it } from 'vitest';
import { validateImportUrl } from '../../src/features/import/importUrl';

describe('validateImportUrl', () => {
  it('accepts HTTPS URLs', () => {
    expect(validateImportUrl('https://example.com/pack.json?version=1')).toBe('https://example.com/pack.json?version=1');
  });

  it('rejects invalid and non-HTTPS URLs', () => {
    for (const value of ['', 'not a url', '/pack.json', 'http://example.com/pack.json', 'javascript:alert(1)', 'ftp://example.com/pack']) {
      expect(validateImportUrl(value)).toBeNull();
    }
  });
});
