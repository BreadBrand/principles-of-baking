import '@testing-library/jest-dom'

// Provide in-memory localStorage for tests
// Node/jsdom requires --localstorage-file to use real localStorage; instead
// we provide a complete working mock that all tests use.
const mockStorage: Record<string, string> = {};

globalThis.localStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    Object.keys(mockStorage).forEach((key) => {
      delete mockStorage[key];
    });
  },
  key: (index: number) => {
    const keys = Object.keys(mockStorage);
    return keys[index] ?? null;
  },
  length: 0,
} as Storage;

// Keep length in sync
Object.defineProperty(globalThis.localStorage, 'length', {
  get: () => Object.keys(mockStorage).length,
})
