import { describe, expect, it } from 'vitest';
import { prepareD1Import } from './d1-import.mjs';

describe('D1 import preparation', () => {
  it('keeps application inserts while dropping dump DDL and transactions', () => {
    const source = `
      PRAGMA foreign_keys=OFF;
      BEGIN TRANSACTION;
      CREATE TABLE users (id TEXT PRIMARY KEY);
      INSERT INTO users VALUES('user-1');
      INSERT INTO user_learning_notes VALUES('note-1','user-1','concept','sql','Title','semi; colon',datetime('now'));
      COMMIT;
    `;

    const result = prepareD1Import(source);

    expect(result.statementCount).toBe(2);
    expect(result.sql).toContain("INSERT INTO users VALUES('user-1');");
    expect(result.sql).toContain("'semi; colon'");
    expect(result.sql).not.toContain('CREATE TABLE');
    expect(result.sql).not.toContain('BEGIN TRANSACTION');
  });

  it('rejects inserts into tables outside the migration contract', () => {
    expect(() => prepareD1Import("INSERT INTO unknown_table VALUES('x');")).toThrow(
      'Unexpected source table'
    );
  });
});
