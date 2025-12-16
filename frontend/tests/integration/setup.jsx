import { beforeEach, afterEach, vi } from 'vitest';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseNavigate = () => mockNavigate;
const mockUseSearchParams = () => {
  const params = new URLSearchParams();
  return [params, vi.fn()];
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: mockUseNavigate,
    useSearchParams: mockUseSearchParams,
    Link: ({ children, to, ...props }) => {
      return <a href={to} {...props}>{children}</a>;
    },
    Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
  };
});

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    elements: vi.fn(() => ({
      create: vi.fn(),
    })),
  })),
}));

// Note: API mocks are NOT created here in setup.jsx
// Each test file should mock the API directly using vi.mock()
// This ensures the mocks are properly recognized as vi.fn() instances

// Helper to create mock API responses
export const createMockResponse = (data, status = 200) => ({
  data: {
    success: status >= 200 && status < 300,
    data,
    message: status >= 200 && status < 300 ? 'Success' : 'Error',
  },
  status,
  statusText: status >= 200 && status < 300 ? 'OK' : 'Error',
});

// Helper to create mock error response
export const createMockError = (message, status = 400) => {
  const error = new Error(message);
  error.response = {
    data: {
      success: false,
      message,
    },
    status,
    statusText: 'Error',
  };
  return error;
};

// Reset mocks before each test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mockNavigate.mockClear();
});

// Cleanup after each test
afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

export { mockNavigate, mockUseNavigate, mockUseSearchParams };

