import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import Login from '../../src/pages/Login';
import Register from '../../src/pages/Register';
import { createMockResponse, createMockError } from './setup';

// Mock API module - must be before imports
vi.mock('../../src/utils/api', () => ({
  authAPI: {
    register: vi.fn(),
    login: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn(),
  },
  cartAPI: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
}));

import { authAPI } from '../../src/utils/api';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe('Login Flow', () => {
    it('should successfully login user and navigate to home', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
      const mockToken = 'test-token-123';

      authAPI.login.mockResolvedValue(
        createMockResponse({ user: mockUser, token: mockToken })
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle login errors and show error message', async () => {
      authAPI.login.mockRejectedValue(
        createMockError('Invalid credentials', 401)
      );

      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalled();
      });

      // Token should not be stored on error
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      render(
        <TestWrapper>
          <Login />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await userEvent.click(submitButton);

      // HTML5 validation should prevent submission
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toBeInvalid();
    });
  });

  describe('Registration Flow', () => {
    it('should successfully register user and navigate to home', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'customer',
      };
      const mockToken = 'test-token-123';

      authAPI.register.mockResolvedValue(
        createMockResponse({ user: mockUser, token: mockToken })
      );

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe(mockToken);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle registration errors', async () => {
      authAPI.register.mockRejectedValue(
        createMockError('Email already exists', 400)
      );

      render(
        <TestWrapper>
          <Register />
        </TestWrapper>
      );

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await userEvent.type(nameInput, 'New User');
      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalled();
      });

      // Token should not be stored on error
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Auth Context Integration', () => {
    it('should load user from localStorage on mount', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
      const mockToken = 'test-token-123';

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      authAPI.getProfile.mockResolvedValue(createMockResponse(mockUser));

      const TestComponent = () => {
        const { user, loading } = useAuth();
        if (loading) return <div>Loading...</div>;
        return <div>{user ? user.name : 'No user'}</div>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(authAPI.getProfile).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });

    it('should clear user data on invalid token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
      const mockToken = 'invalid-token';

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      authAPI.getProfile.mockRejectedValue(
        createMockError('Invalid token', 401)
      );

      const TestComponent = () => {
        const { user, loading } = useAuth();
        if (loading) return <div>Loading...</div>;
        return <div>{user ? user.name : 'No user'}</div>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(authAPI.getProfile).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });

    it('should logout user and clear localStorage', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
      const mockToken = 'test-token-123';

      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      authAPI.logout.mockResolvedValue(createMockResponse(null));

      const TestComponent = () => {
        const { user, logout } = useAuth();
        return (
          <div>
            {user ? <div>{user.name}</div> : <div>No user</div>}
            <button onClick={logout}>Logout</button>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await userEvent.click(logoutButton);

      await waitFor(() => {
        expect(authAPI.logout).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      });
    });
  });
});

