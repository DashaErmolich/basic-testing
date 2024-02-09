import axios from 'axios';
import { throttledGetDataFromApi } from './index';

jest.mock('lodash', () => {
  const originalModule = jest.requireActual('lodash');

  return {
    __esModule: true,
    ...originalModule,
    throttle: jest.fn((fn) => fn),
  };
});

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const RESOURCE_PATH = 'posts';

describe('throttledGetDataFromApi', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.unmock('lodash');
  });

  test('should create instance with provided base url', async () => {
    const axiosCreateSpy = jest.spyOn(axios, 'create');

    await throttledGetDataFromApi(RESOURCE_PATH);

    expect(axiosCreateSpy).toBeCalledWith({ baseURL: BASE_URL });
  });

  test('should perform request to correct provided url', async () => {
    // const axiosClientGetSpy = jest.spyOn(axios.create(), 'get');
    // await throttledGetDataFromApi(RESOURCE_PATH);
    // expect(axiosClientGetSpy).toBeCalled();
  });

  test('should return response data', async () => {
    const data = await throttledGetDataFromApi(RESOURCE_PATH);

    expect(data).toBeTruthy();

    expect(Array.isArray(data)).toBeTruthy();
  });
});
