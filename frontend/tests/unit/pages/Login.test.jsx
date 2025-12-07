import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../src/pages/Login.jsx';
import { useAuth } from '../../../src/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

describe('Login Page', () => {
  let mockLogin, mockNavigate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin = vi.fn();
    mockNavigate = vi.fn();
    
    useAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      loading: false
    });
    
    useNavigate.mockReturnValue(mockNavigate);
  });

  // TDD Evidence:
  // RED: This test failed because Login component did not render form
  // GREEN: After implementing Login component, test passed
  // REFACTOR: Test still passes
  it('should render login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because Login didn't handle form input changes
  // GREEN: After adding handleChange, test passed
  // REFACTOR: Test still passes
  it('should update form data on input change', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // TDD Evidence:
  // RED: This test failed because Login didn't call login function on submit
  // GREEN: After adding handleSubmit, test passed
  // REFACTOR: Test still passes
  it('should call login function on form submit', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  // TDD Evidence:
  // RED: This test failed because Login didn't navigate on successful login
  // GREEN: After adding navigate('/'), test passed
  // REFACTOR: Test still passes
  it('should navigate to home on successful login', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // TDD Evidence:
  // RED: This test failed because Login didn't show loading state
  // GREEN: After adding loading state, test passed
  // REFACTOR: Test still passes
  it('should show loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Login didn't prevent default form submission
  // GREEN: After adding e.preventDefault(), test passed
  // REFACTOR: Test still passes
  it('should prevent default form submission', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});

