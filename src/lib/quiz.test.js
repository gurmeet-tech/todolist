import { describe, expect, it } from 'vitest';

import { BANK, QUESTION_TIME, ROUND_SIZE, makeRound, shuffle } from './quiz';

describe('shuffle', () => {
  it('keeps the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    expect([...shuffle(input)].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b));
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3];
    shuffle(input);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('makeRound', () => {
  it('returns a round of unique questions', () => {
    const round = makeRound();
    expect(round).toHaveLength(ROUND_SIZE);
    expect(new Set(round.map(item => item.q)).size).toBe(ROUND_SIZE);
  });

  it('places the answer among the options', () => {
    for (const item of makeRound()) {
      expect(item.options).toContain(item.answer);
    }
  });

  it('avoids excluded prompts when the pool is large enough', () => {
    const excluded = makeRound().map(item => item.q);
    const overlap = makeRound(excluded).filter(item => excluded.includes(item.q));
    expect(overlap).toHaveLength(0);
  });
});

describe('constants', () => {
  it('has a bank at least as large as a round and a positive timer', () => {
    expect(BANK.length).toBeGreaterThanOrEqual(ROUND_SIZE);
    expect(QUESTION_TIME).toBeGreaterThan(0);
  });
});
