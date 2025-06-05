// __tests__/setup/jest.setup.js

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Cleanup before each test
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// Global cleanup after each test
afterEach(() => {
  document.body.innerHTML = '';
});