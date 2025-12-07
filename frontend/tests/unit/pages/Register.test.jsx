import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../../src/pages/Register.jsx';
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

describe('Register Page', () => {
  let mockRegister, mockNavigate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister = vi.fn();
    mockNavigate = vi.fn();
    
    useAuth.mockReturnValue({
      register: mockRegister,
      user: null,
      loading: false
    });
    
    useNavigate.mockReturnValue(mockNavigate);
    
    // Mock window.alert
    window.alert = vi.fn();
  });

  // TDD Evidence:
  // RED: This test failed because Register component did not render form
  // GREEN: After implementing Register component, test passed
  // REFACTOR: Test still passes
  it('should render registration form', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because Register didn't handle form input changes
  // GREEN: After adding handleChange, test passed
  // REFACTOR: Test still passes
  it('should update form data on input change', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'password123' } });

    expect(nameInput.value).toBe('Test User');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  // TDD Evidence:
  // RED: This test failed because Register didn't validate password match
  // GREEN: After adding password match validation, test passed
  // REFACTOR: Test still passes
  it('should show alert when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'different' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Passwords do not match');
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Register didn't validate password length
  // GREEN: After adding password length validation, test passed
  // REFACTOR: Test still passes
  it('should show alert when password is too short', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: '12345' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: '12345' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Password must be at least 6 characters');
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Register didn't call register function on submit
  // GREEN: After adding handleSubmit, test passed
  // REFACTOR: Test still passes
  it('should call register function on form submit', async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  // TDD Evidence:
  // RED: This test failed because Register didn't navigate on successful registration
  // GREEN: After adding navigate('/'), test passed
  // REFACTOR: Test still passes
  it('should navigate to home on successful registration', async () => {
    mockRegister.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // TDD Evidence:
  // RED: This test failed because Register didn't show loading state
  // GREEN: After adding loading state, test passed
  // REFACTOR: Test still passes
  it('should show loading state during registration', async () => {
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { name: 'confirmPassword', value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});

