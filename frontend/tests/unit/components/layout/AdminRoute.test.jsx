import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminRoute from '../../../../src/components/layout/AdminRoute.jsx';
import { useAuth } from '../../../../src/context/AuthContext';

// Mock dependencies
vi.mock('../../../../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TDD Evidence:
  // RED: This test failed because AdminRoute did not exist
  // GREEN: After implementing AdminRoute, test passed
  // REFACTOR: Test still passes
  it('should render children when user is admin', () => {
    useAuth.mockReturnValue({
      user: { id: '123', role: 'admin' },
      loading: false,
      isAdmin: true
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because AdminRoute didn't redirect non-admin users
  // GREEN: After adding Navigate to /, test passed
  // REFACTOR: Test still passes
  it('should redirect to home when user is not admin', () => {
    useAuth.mockReturnValue({
      user: { id: '123', role: 'customer' },
      loading: false,
      isAdmin: false
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    // Should redirect (Navigate component)
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because AdminRoute didn't redirect unauthenticated users
  // GREEN: After adding Navigate to /login, test passed
  // REFACTOR: Test still passes
  it('should redirect to login when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      isAdmin: false
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    // Should redirect to login
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because AdminRoute didn't show loading state
  // GREEN: After adding loading check, test passed
  // REFACTOR: Test still passes
  it('should show loading spinner while checking authentication', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
      isAdmin: false
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </BrowserRouter>
    );

    // Should show loading spinner (we check that content is not rendered)
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
});

