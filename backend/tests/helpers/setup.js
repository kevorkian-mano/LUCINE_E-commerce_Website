// Test setup file
// This runs before all tests

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRE = '1h';
process.env.NODE_ENV = 'test';

// Suppress console logs during tests (optional)
// Uncomment if you want cleaner test output
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

