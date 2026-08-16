import '@testing-library/jest-dom'

// Polyfill localStorage for jsdom environment
if (typeof localStorage === 'undefined') {
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
  });
}
