import { describe, expect, it } from 'vitest';

import { loginHref, recordDestination } from './recordReturn';

describe('recordDestination', () => {
  it('accepts record routes, normalizing case and trailing slashes', () => {
    expect(recordDestination('/record')).toBe('/record');
    expect(recordDestination('/record/')).toBe('/record');
    expect(recordDestination('/Record')).toBe('/record');
    expect(recordDestination('/record/sessions/ses_test/')).toBe('/record/sessions/ses_test');
    expect(recordDestination('/record#knowledge')).toBe('/record#knowledge');
  });

  it('rejects anything that is not a record page', () => {
    expect(recordDestination('/record/unknown')).toBeNull();
    expect(recordDestination('/record/widgets/x')).toBeNull();
    expect(recordDestination('//evil.example/record')).toBeNull();
    expect(recordDestination('https://evil.example/record')).toBeNull();
    expect(recordDestination('/dashboard')).toBeNull();
    expect(recordDestination(null)).toBeNull();
  });

  it('builds a sign-in link only for record pages', () => {
    expect(loginHref('/record/courses/c1', '#x')).toBe(
      '/login?next=%2Frecord%2Fcourses%2Fc1%23x#sign-in'
    );
    expect(loginHref('/practice')).toBe('/login#sign-in');
  });
});
