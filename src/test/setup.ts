import '@testing-library/jest-dom'

// Provide in-memory localStorage for tests.
//
// Node's own (experimental) global `localStorage` shadows jsdom's real
// implementation and throws/warns without --localstorage-file, so we can't
// just rely on `environment: 'jsdom'` alone. We also can't replace
// `globalThis.localStorage` with a plain object literal: its prototype would
// be `Object.prototype`, not `Storage.prototype`, which silently defeats any
// test that does `vi.spyOn(Storage.prototype, 'setItem')` — the spy patches
// a prototype the mock never uses, so it never intercepts real calls.
//
// Instead, the mock storage methods are installed directly onto
// `Storage.prototype`, and `globalThis.localStorage` is an object that
// inherits from it (via `Object.create`) with no own `getItem`/`setItem`/etc.
// properties to shadow the prototype. That way `vi.spyOn(Storage.prototype,
// 'setItem')` genuinely intercepts calls made through `localStorage.setItem`.
const mockStorageData: Record<string, string> = {};

Object.defineProperties(Storage.prototype, {
  getItem: {
    value: (key: string) => mockStorageData[key] ?? null,
    writable: true,
    configurable: true,
  },
  setItem: {
    value: (key: string, value: string) => {
      mockStorageData[key] = value;
    },
    writable: true,
    configurable: true,
  },
  removeItem: {
    value: (key: string) => {
      delete mockStorageData[key];
    },
    writable: true,
    configurable: true,
  },
  clear: {
    value: () => {
      Object.keys(mockStorageData).forEach((key) => {
        delete mockStorageData[key];
      });
    },
    writable: true,
    configurable: true,
  },
  key: {
    value: (index: number) => {
      const keys = Object.keys(mockStorageData);
      return keys[index] ?? null;
    },
    writable: true,
    configurable: true,
  },
  length: {
    get: () => Object.keys(mockStorageData).length,
    configurable: true,
  },
});

globalThis.localStorage = Object.create(Storage.prototype) as Storage;
