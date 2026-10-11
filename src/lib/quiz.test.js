import { describe, expect, it } from 'vitest';

import { QUESTION_TIME, ROUND_SIZE, makeRound, shuffle } from './quiz';

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
  it('builds a full round of unique questions', () => {
    const round = makeRound();
    expect(round).toHaveLength(ROUND_SIZE);
    expect(new Set(round.map(item => item.q)).size).toBe(ROUND_SIZE);
  });

  it('gives every question four unique options including the answer exactly once', () => {
    for (const item of makeRound()) {
      expect(item.options).toHaveLength(4);
      expect(new Set(item.options).size).toBe(4);
      expect(item.options).toContain(item.answer);
      expect(item.options.filter(option => option === item.answer)).toHaveLength(1);
    }
  });

  it('avoids excluded prompts when generating the next round', () => {
    const excluded = makeRound().map(item => item.q);
    const overlap = makeRound(excluded).filter(item => excluded.includes(item.q));
    expect(overlap).toHaveLength(0);
  });

  it('spreads questions across more than one topic', () => {
    const topics = new Set(makeRound().map(item => item.topic));
    expect(topics.size).toBeGreaterThan(1);
  });
});

describe('constants', () => {
  it('uses a positive timer', () => {
    expect(QUESTION_TIME).toBeGreaterThan(0);
  });
});
