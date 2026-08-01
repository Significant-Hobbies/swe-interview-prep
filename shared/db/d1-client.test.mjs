import { describe, expect, it, vi } from 'vitest';
import { createD1Client } from './d1-client.mjs';

function fakeDatabase(result) {
  const all = vi.fn().mockResolvedValue(result);
  const bind = vi.fn(() => ({ all }));
  const prepare = vi.fn(() => ({ all, bind }));
  return { database: { prepare }, prepare, bind, all };
}

describe('D1 query adapter', () => {
  it('normalizes selected rows and binds positional arguments', async () => {
    const fake = fakeDatabase({
      results: [{ problem_id: 'two-sum' }],
      meta: { changes: 0 },
    });

    const result = await createD1Client(fake.database).execute({
      sql: 'SELECT problem_id FROM user_progress WHERE user_id = ?',
      args: ['user-1'],
    });

    expect(fake.prepare).toHaveBeenCalledWith(
      'SELECT problem_id FROM user_progress WHERE user_id = ?'
    );
    expect(fake.bind).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ rows: [{ problem_id: 'two-sum' }], rowsAffected: 0 });
  });

  it('normalizes write metadata and accepts a bare SQL string', async () => {
    const fake = fakeDatabase({ results: [], meta: { changes: 1 } });

    const result = await createD1Client(fake.database).execute('DELETE FROM activity_log');

    expect(fake.bind).not.toHaveBeenCalled();
    expect(result).toEqual({ rows: [], rowsAffected: 1 });
  });

  it('fails closed when the Pages D1 binding is absent', () => {
    expect(() => createD1Client()).toThrow('Missing DB D1 binding');
  });
});
