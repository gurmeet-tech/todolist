export const ROUND_SIZE = 8;
export const QUESTION_TIME = 15;

/**
 * @typedef {Object} Question
 * @property {string} topic
 * @property {string} q
 * @property {string[]} options
 * @property {string} answer
 */

const SUPERSCRIPT = {
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹'
};

/** Render a number as superscript characters, e.g. 4 -> "⁴". */
const sup = value =>
  String(value)
    .split('')
    .map(char => SUPERSCRIPT[char] ?? char)
    .join('');

/** @param {number} min @param {number} max */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** @template T @param {T[]} list @returns {T} */
const pick = list => list[Math.floor(Math.random() * list.length)];

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
 * Assemble a question with exactly four unique options, one of which is the
 * answer. Distractors that repeat the answer or each other are dropped; for
 * numeric answers sensible near-miss values are used as a fallback.
 * @param {string} topic
 * @param {string} q
 * @param {string | number} answer
 * @param {Array<string | number>} candidates
 * @returns {Question}
 */
const assemble = (topic, q, answer, candidates) => {
  const answerStr = String(answer);
  const seen = new Set([answerStr]);
  const distractors = [];
  const consider = value => {
    if (distractors.length >= 3 || value === undefined || value === null) return;
    const text = String(value);
    if (seen.has(text)) return;
    seen.add(text);
    distractors.push(text);
  };

  candidates.forEach(consider);

  if (typeof answer === 'number') {
    [1, -1, 2, -2, 3, -3].forEach(delta => consider(answer + delta));
    consider(answer * 2);
    let guard = 0;
    while (distractors.length < 3 && guard < 40) {
      consider(randInt(1, 99));
      guard += 1;
    }
  }

  return { topic, q, options: shuffle([answerStr, ...distractors]), answer: answerStr };
};

/* ------------------------------------------------------------------ */
/* Matrices                                                            */
/* ------------------------------------------------------------------ */

const matrixOrder = () => {
  const [m, n, p] = shuffle([2, 3, 4]);
  return assemble(
    'Matrices',
    `A is a ${m}×${n} matrix and B is a ${n}×${p} matrix. The order of AB is`,
    `${m}×${p}`,
    [`${m}×${n}`, `${n}×${p}`, `${p}×${m}`, `${p}×${p}`]
  );
};

const matrixElements = () => {
  let m = randInt(2, 4);
  let n = randInt(2, 4);
  if (m + n === m * n) n = n === 4 ? 3 : 4;
  const count = m * n;
  return assemble(
    'Matrices',
    `How many elements are there in a matrix of order ${m}×${n}?`,
    count,
    [m + n, count - 1, count + 1, count + m]
  );
};

const matrixDeterminant = () => {
  const a = randInt(1, 5);
  const b = randInt(1, 5);
  const c = randInt(1, 5);
  const d = randInt(1, 5);
  return assemble('Matrices', `The determinant of [[${a}, ${b}], [${c}, ${d}]] is`, a * d - b * c, [
    a * d + b * c,
    b * c - a * d,
    a * b - c * d,
    a * c + b * d
  ]);
};

const matrixTrace = () => {
  const a = randInt(1, 6);
  const b = randInt(1, 6);
  const c = randInt(1, 6);
  const d = randInt(1, 6);
  return assemble('Matrices', `The trace of [[${a}, ${b}], [${c}, ${d}]] is`, a + d, [
    b + c,
    a * d,
    a + b + c + d,
    a * b + c * d
  ]);
};

const matrixDiagonalDeterminant = () => {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  return assemble(
    'Matrices',
    `The determinant of the diagonal matrix [[${a}, 0], [0, ${b}]] is`,
    a * b,
    [a + b, a * b - a, a * b + b, a * (b + 1)]
  );
};

const matrixTranspose = () =>
  assemble('Matrices', 'For any square matrix A, (Aᵀ)ᵀ equals', 'A', ['Aᵀ', 'A⁻¹', 'I', '−A']);

/* ------------------------------------------------------------------ */
/* Differentiation                                                     */
/* ------------------------------------------------------------------ */

const derivativePower = () => {
  const n = randInt(2, 6);
  return assemble('Differentiation', `d/dx (x${sup(n)}) =`, `${n}x${sup(n - 1)}`, [
    `x${sup(n - 1)}`,
    `${n}x${sup(n)}`,
    `${n - 1}x${sup(n)}`,
    `${n + 1}x${sup(n - 1)}`
  ]);
};

const derivativeScaledPower = () => {
  const n = randInt(3, 5);
  let a = randInt(2, 6);
  if (a === n) a = a === 6 ? 2 : a + 1;
  return assemble('Differentiation', `d/dx (${a}x${sup(n)}) =`, `${a * n}x${sup(n - 1)}`, [
    `${a}x${sup(n - 1)}`,
    `${a * n}x${sup(n)}`,
    `${a * (n - 1)}x${sup(n - 1)}`,
    `${n}x${sup(n - 1)}`
  ]);
};

const derivativeTrig = () => {
  const variants = [
    ['sin x', 'cos x', ['−cos x', 'sin x', '−sin x']],
    ['cos x', '−sin x', ['sin x', '−cos x', 'cos x']],
    ['tan x', 'sec²x', ['−sec²x', 'sec x·tan x', 'cos²x']]
  ];
  const [inner, answer, distractors] = pick(variants);
  return assemble('Differentiation', `d/dx (${inner}) =`, answer, distractors);
};

const derivativeExponential = () => {
  const k = randInt(2, 5);
  return assemble('Differentiation', `d/dx (e${sup(k)}ˣ) =`, `${k}e${sup(k)}ˣ`, [
    `e${sup(k)}ˣ`,
    `${k}xe${sup(k)}ˣ`,
    `e${sup(k)}`,
    `${k * k}e${sup(k)}ˣ`
  ]);
};

const derivativeLog = () =>
  assemble('Differentiation', 'd/dx (ln x) =', '1/x', ['x', 'ln x', '−1/x', '1/x²']);

/* ------------------------------------------------------------------ */
/* Relations & Functions                                               */
/* ------------------------------------------------------------------ */

const domainFraction = () => {
  const a = randInt(1, 5);
  return assemble('Relations & Functions', `The domain of f(x) = 1/(x − ${a}) is`, `R − {${a}}`, [
    'R',
    'R − {0}',
    `(${a}, ∞)`,
    `[${a}, ∞)`,
    `R − {−${a}}`
  ]);
};

const domainSquareRoot = () => {
  const a = randInt(1, 6);
  return assemble('Relations & Functions', `The domain of f(x) = √(x − ${a}) is`, `[${a}, ∞)`, [
    `(${a}, ∞)`,
    'R',
    `(−∞, ${a}]`,
    `[−${a}, ∞)`
  ]);
};

const relationCount = () => {
  let m = randInt(2, 4);
  let n = randInt(2, 4);
  if (m === 2 && n === 2) n = 3;
  const total = m * n;
  return assemble(
    'Relations & Functions',
    `The number of relations from a ${m}-element set to a ${n}-element set is`,
    2 ** total,
    [2 ** (m + n), total, 2 ** (total - 1), m ** n]
  );
};

const functionComposition = () =>
  assemble('Relations & Functions', 'If f(x) = x², then f(f(x)) =', 'x⁴', [
    'x²',
    '2x²',
    'x⁸',
    'x⁶'
  ]);

const rangeSquare = () =>
  assemble('Relations & Functions', 'The range of f(x) = x² over R is', '[0, ∞)', [
    'R',
    '(0, ∞)',
    '[1, ∞)',
    '(−∞, 0]'
  ]);

const linearBijection = () => {
  const a = randInt(1, 5);
  const b = randInt(1, 9);
  return assemble(
    'Relations & Functions',
    `f : R → R, f(x) = ${a}x + ${b} is`,
    'one-one and onto',
    ['one-one only', 'onto only', 'neither', 'constant']
  );
};

const TOPICS = {
  Matrices: [
    matrixOrder,
    matrixElements,
    matrixDeterminant,
    matrixTrace,
    matrixDiagonalDeterminant,
    matrixTranspose
  ],
  Differentiation: [
    derivativePower,
    derivativeScaledPower,
    derivativeTrig,
    derivativeExponential,
    derivativeLog
  ],
  'Relations & Functions': [
    domainFraction,
    domainSquareRoot,
    relationCount,
    functionComposition,
    rangeSquare,
    linearBijection
  ]
};

const TOPIC_NAMES = Object.keys(TOPICS);

const makeQuestion = topic => pick(TOPICS[topic])();

/**
 * Build a round of freshly generated questions, cycling through topics and
 * avoiding any prompt in `exclude` so back-to-back rounds feel new.
 * @param {string[]} [exclude]
 * @returns {Question[]}
 */
export const makeRound = (exclude = []) => {
  const used = new Set(exclude);
  const order = shuffle(TOPIC_NAMES);
  const round = [];
  let slot = 0;
  let guard = 0;
  const limit = ROUND_SIZE * 500;

  while (round.length < ROUND_SIZE && guard < limit) {
    guard += 1;
    const topic = order[slot % order.length];
    slot += 1;
    const question = makeQuestion(topic);
    if (used.has(question.q)) continue;
    used.add(question.q);
    round.push(question);
  }

  while (round.length < ROUND_SIZE) {
    const topic = order[slot % order.length];
    slot += 1;
    round.push(makeQuestion(topic));
  }

  return round;
};
