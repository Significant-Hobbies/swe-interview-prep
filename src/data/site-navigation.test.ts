import { describe, expect, it } from 'vitest';

import { BROWSE_NAV_ITEMS, PRIMARY_NAV_ITEMS, SITE_NAV_ITEMS } from './site-navigation';

describe('site navigation model', () => {
  it('keeps destination paths and labels unique', () => {
    expect(new Set(SITE_NAV_ITEMS.map((item) => item.to)).size).toBe(SITE_NAV_ITEMS.length);
    expect(new Set(SITE_NAV_ITEMS.map((item) => item.label)).size).toBe(SITE_NAV_ITEMS.length);
  });

  it('keeps task navigation compact and curriculum discoverable', () => {
    expect(PRIMARY_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Today',
      'Learn',
      'Practice',
      'Mock',
      'Playground',
      'Progress',
    ]);
    expect(BROWSE_NAV_ITEMS[0]).toMatchObject({
      label: 'Curriculum',
      to: '/curriculum/',
    });
  });
});
