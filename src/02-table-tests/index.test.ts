import { simpleCalculator, Action } from './index';

const testCases = [
  { a: 1, b: 2, action: Action.Add, expected: 3 },
  { a: 9, b: 3, action: Action.Subtract, expected: 6 },
  { a: 8, b: 10, action: Action.Multiply, expected: 80 },
  { a: 12, b: 6, action: Action.Divide, expected: 2 },
  {
    a: 2,
    b: 3,
    action: Action.Exponentiate,
    expected: 8,
  },
  { a: 12, b: 6, action: '{', expected: null },
  { a: '12', b: !!2, action: Action.Add, expected: null },
];

describe('simpleCalculator', () => {
  test.each([testCases])(
    'should calculate correctly',
    ({ a, b, action, expected }) => {
      const result = simpleCalculator({ a, b, action });
      expect(result).toEqual(expected);
    },
  );
});
