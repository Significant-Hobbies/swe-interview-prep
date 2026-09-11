import { describe, expect, it } from 'vitest';
import { scaleSaveKey } from './storage';
describe('Scale account isolation', () => {
  it('separates guest, named guest account, and signed-in companies', () => {
    expect(
      new Set([scaleSaveKey(), scaleSaveKey('guest'), scaleSaveKey('a'), scaleSaveKey('b')]).size
    ).toBe(4);
  });
  it('returns the same key after switching back to an account', () => {
    expect(scaleSaveKey('user/one')).toBe('swe:scale:company:v1:account:user%2Fone');
  });
});
