import {
  readFileAsynchronously,
  doStuffByTimeout,
  doStuffByInterval,
} from './index';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';

jest.mock('fs');
jest.mock('fs/promises');
jest.mock('path');

describe('doStuffByTimeout', () => {
  const MS = 2000;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
    jest.unmock('fs');
    jest.unmock('fs/promises');
    jest.unmock('path');
  });

  beforeEach(() => {
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('should set timeout with provided callback and timeout', () => {
    const callback = jest.fn();

    doStuffByTimeout(callback, MS);

    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).toBeCalledWith(callback, MS);
  });

  test('should call callback only after timeout', () => {
    let counter = 0;
    const callback = jest.fn(() => counter++);

    doStuffByTimeout(callback, MS);

    expect(setTimeout).toBeCalledTimes(1);
    expect(setTimeout).toBeCalledWith(callback, MS);
    expect(callback).not.toBeCalled();

    jest.advanceTimersByTime(MS);

    expect(callback).toBeCalledTimes(counter);

    jest.advanceTimersByTime(MS);

    expect(callback).not.toBeCalledTimes(counter + 1);
  });
});

describe('doStuffByInterval', () => {
  const MS = 2000;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.spyOn(global, 'setInterval');
  });

  test('should set interval with provided callback and timeout', () => {
    const callback = jest.fn();

    doStuffByInterval(callback, MS);

    expect(setInterval).toBeCalledTimes(1);
    expect(setInterval).toBeCalledWith(callback, MS);
  });

  test('should call callback multiple times after multiple intervals', () => {
    let counter = 0;
    const callback = jest.fn(() => counter++);

    const INTERVALS_COUNT = 5;

    doStuffByInterval(callback, MS);

    expect(setInterval).toBeCalledTimes(1);
    expect(callback).not.toBeCalled();
    expect(counter).toBe(0);

    while (counter < INTERVALS_COUNT) {
      jest.advanceTimersByTime(MS);

      expect(setInterval).not.toBeCalledTimes(counter + 1);
      expect(callback).toBeCalledTimes(counter);
    }
  });
});

describe('readFileAsynchronously', () => {
  const PATH_TO_FILE = 'test.txt';

  test('should call join with pathToFile', async () => {
    await readFileAsynchronously(PATH_TO_FILE);

    expect(join as jest.Mock).toBeCalledTimes(1);
    expect(join as jest.Mock).toBeCalledWith(__dirname, PATH_TO_FILE);
  });

  test('should return null if file does not exist', async () => {
    (existsSync as jest.Mock).mockReturnValueOnce(false);

    const fileContent: string | null = await readFileAsynchronously(
      PATH_TO_FILE,
    );

    expect(fileContent).toBeNull();
  });

  test('should return file content if file exists', async () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true);
    (readFile as jest.Mock).mockResolvedValue('file content');

    const fileContent: string | null = await readFileAsynchronously(
      PATH_TO_FILE,
    );

    expect(typeof fileContent).toBe('string');
  });
});
