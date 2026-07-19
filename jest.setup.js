// jest.setup.js
// Jest setup file - runs before each test

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
}));

// Mock Firebase
jest.mock('./firebase/config', () => ({
  auth: {},
  db: {},
  app: {},
  storage: {},
}));

// Mock window.gtag for analytics tests
global.gtag = jest.fn();
