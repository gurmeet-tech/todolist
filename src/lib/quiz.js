export const ROUND_SIZE = 8;
export const QUESTION_TIME = 15;

/**
 * @typedef {Object} Question
 * @property {string} topic
 * @property {string} q
 * @property {string[]} options
 * @property {string} answer
 */

/** @type {Question[]} */
export const BANK = [
  {
    topic: 'Matrices',
    q: 'If A is 2×3 and B is 3×4, the order of AB is',
    options: ['2×4', '3×3', '4×2', '2×3'],
    answer: '2×4'
  },
  {
    topic: 'Matrices',
    q: 'The determinant of [[3, 1], [2, 4]] is',
    options: ['10', '14', '8', '2'],
    answer: '10'
  },
  {
    topic: 'Matrices',
    q: 'A matrix has 8 elements. Which order is impossible?',
    options: ['3×3', '2×4', '4×2', '1×8'],
    answer: '3×3'
  },
  { topic: 'Matrices', q: '(Aᵀ)ᵀ equals', options: ['A', 'Aᵀ', 'A⁻¹', 'I'], answer: 'A' },
  {
    topic: 'Matrices',
    q: 'The trace of [[1, 2], [3, 4]] is',
    options: ['5', '7', '10', '4'],
    answer: '5'
  },
  {
    topic: 'Matrices',
    q: 'The determinant of [[2, 0], [0, 3]] is',
    options: ['6', '5', '0', '1'],
    answer: '6'
  },
  {
    topic: 'Differentiation',
    q: 'd/dx (x⁵) =',
    options: ['5x⁴', 'x⁴', '5x⁶', '4x⁵'],
    answer: '5x⁴'
  },
  {
    topic: 'Differentiation',
    q: 'd/dx (sin x) =',
    options: ['cos x', '−cos x', 'sin x', '−sin x'],
    answer: 'cos x'
  },
  {
    topic: 'Differentiation',
    q: 'd/dx (e³ˣ) =',
    options: ['3e³ˣ', 'e³ˣ', '3x·e³ˣ', 'e³'],
    answer: '3e³ˣ'
  },
  {
    topic: 'Differentiation',
    q: 'd/dx (ln x) =',
    options: ['1/x', 'x', 'ln x', '−1/x'],
    answer: '1/x'
  },
  {
    topic: 'Differentiation',
    q: 'd/dx (cos x) =',
    options: ['−sin x', 'sin x', '−cos x', 'cos x'],
    answer: '−sin x'
  },
  {
    topic: 'Differentiation',
    q: 'd/dx (tan x) =',
    options: ['sec²x', '−sec²x', 'sec x·tan x', 'cos²x'],
    answer: 'sec²x'
  },
  {
    topic: 'Differentiation',
    q: 'd/dx (x² sin x) =',
    options: ['2x sin x + x² cos x', '2x cos x', 'x² cos x', '2x sin x'],
    answer: '2x sin x + x² cos x'
  },
  { topic: 'Differentiation', q: 'd/dx (7) =', options: ['0', '7', '1', '7x'], answer: '0' },
  {
    topic: 'Relations & Functions',
    q: 'The domain of f(x) = 1/(x − 2) is',
    options: ['R − {2}', 'R', 'R − {0}', '(2, ∞)'],
    answer: 'R − {2}'
  },
  {
    topic: 'Relations & Functions',
    q: 'If f(x) = x², then f(f(x)) =',
    options: ['x⁴', 'x²', '2x²', 'x⁸'],
    answer: 'x⁴'
  },
  {
    topic: 'Relations & Functions',
    q: 'The range of f(x) = x² over R is',
    options: ['[0, ∞)', 'R', '(0, ∞)', '[1, ∞)'],
    answer: '[0, ∞)'
  },
  {
    topic: 'Relations & Functions',
    q: 'A relation R on a set A is a subset of',
    options: ['A × A', 'A', 'A ∪ A', '∅ only'],
    answer: 'A × A'
  },
  {
    topic: 'Relations & Functions',
    q: 'Number of relations from a 2-element set to a 3-element set',
    options: ['64', '32', '16', '6'],
    answer: '64'
  },
  {
    topic: 'Relations & Functions',
    q: 'f : R → R, f(x) = 2x + 1 is',
    options: ['one-one and onto', 'one-one only', 'onto only', 'neither'],
    answer: 'one-one and onto'
  },
  {
    topic: 'Relations & Functions',
    q: 'The domain of √(x − 3) is',
    options: ['[3, ∞)', '(3, ∞)', 'R', '(−∞, 3]'],
    answer: '[3, ∞)'
  }
];

/** @template T @param {T[]} list @returns {T[]} */
export const shuffle = list => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Build a round of shuffled questions, avoiding the given prompts when possible
 * (so back-to-back rounds don't repeat).
 * @param {string[]} [exclude]
 * @returns {Question[]}
 */
export const makeRound = (exclude = []) => {
  const pool = BANK.filter(item => !exclude.includes(item.q));
  const source = pool.length >= ROUND_SIZE ? pool : BANK;
  return shuffle(source)
    .slice(0, ROUND_SIZE)
    .map(item => ({ ...item, options: shuffle(item.options) }));
};
