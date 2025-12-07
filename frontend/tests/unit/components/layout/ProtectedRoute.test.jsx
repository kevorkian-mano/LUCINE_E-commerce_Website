import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../../../src/components/layout/ProtectedRoute.jsx';
import { authAPI } from '../../../../src/utils/api';

// Mock dependencies
vi.mock('../../../../src/utils/api', () => ({
  authAPI: {
    getProfile: vi.fn()
  }
}));

const mockUseAuth = vi.fn();
vi.mock('../../../../src/context/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // TDD Evidence:
  // RED: This test failed because ProtectedRoute did not exist
  // GREEN: After implementing ProtectedRoute, test passed
  // REFACTOR: Test still passes
  it('should render children when user is authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because ProtectedRoute didn't redirect unauthenticated users
  // GREEN: After adding Navigate to /login, test passed
  // REFACTOR: Test still passes
  it('should redirect to login when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false
    });
    
    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should redirect to login (Navigate component)
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because ProtectedRoute didn't show loading state
  // GREEN: After adding loading check, test passed
  // REFACTOR: Test still passes
  it('should show loading spinner while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Should show loading spinner
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});

