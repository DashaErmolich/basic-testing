import { generateLinkedList } from './index';

describe('generateLinkedList', () => {
  const ELEMENTS = [1, 2, 3];
  const SNAPSHOT = {
    value: ELEMENTS[0],
    next: {
      value: ELEMENTS[1],
      next: {
        value: ELEMENTS[2],
        next: {
          value: null,
          next: null,
        },
      },
    },
  };
  // Check match by expect(...).toStrictEqual(...)
  test('should generate linked list from values 1', () => {
    const linkedList = generateLinkedList<number>(ELEMENTS);
    expect(linkedList).toStrictEqual(SNAPSHOT);
  });

  // Check match by comparison with snapshot
  test('should generate linked list from values 2', () => {
    const linkedList = generateLinkedList<number>(ELEMENTS);
    expect(linkedList).toMatchSnapshot();
  });
});
