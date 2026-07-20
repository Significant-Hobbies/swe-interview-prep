export interface TestCase {
  args: unknown[];
  expected: unknown;
  description: string;
}

export type Language = 'javascript' | 'typescript' | 'go';
