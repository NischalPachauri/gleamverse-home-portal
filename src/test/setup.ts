import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => null),
  setItem: vi.fn((key: string, value: string) => { }),
  removeItem: vi.fn((key: string) => { }),
  clear: vi.fn(() => { }),
  length: 0,
  key: vi.fn((index: number) => null),
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', { value: localStorageMock });

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock performance APIs
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  } as Performance,
});

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  private callback: (list: PerformanceObserverEntryList, observer: PerformanceObserver) => void;
  constructor(callback: (list: PerformanceObserverEntryList, observer: PerformanceObserver) => void) {
    this.callback = callback;
  }
  observe() {}
  disconnect() {}
};

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};