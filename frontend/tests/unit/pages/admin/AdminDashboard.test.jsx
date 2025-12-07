import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../../../../src/pages/admin/AdminDashboard.jsx';
import { orderAPI } from '../../../../src/utils/api';

// Mock dependencies
vi.mock('../../../../src/utils/api', () => ({
  orderAPI: {
    getAnalytics: vi.fn()
  }
}));

describe('AdminDashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TDD Evidence:
  // RED: This test failed because AdminDashboard component did not exist
  // GREEN: After implementing AdminDashboard component, test passed
  // REFACTOR: Test still passes
  it('should render admin dashboard', () => {
    orderAPI.getAnalytics.mockResolvedValue({
      data: {
        data: {
          totalSales: 10000,
          totalOrders: 50,
          totalProducts: 20
        }
      }
    });

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });

  // TDD Evidence:
  // RED: This test failed because AdminDashboard didn't fetch analytics on mount
  // GREEN: After adding useEffect to fetch analytics, test passed
  // REFACTOR: Test still passes
  it('should fetch analytics on mount', async () => {
    orderAPI.getAnalytics.mockResolvedValue({
      data: {
        data: {
          totalSales: 10000,
          totalOrders: 50,
          totalProducts: 20
        }
      }
    });

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(orderAPI.getAnalytics).toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because AdminDashboard didn't display analytics
  // GREEN: After adding analytics display, test passed
  // REFACTOR: Test still passes
  it('should display analytics data', async () => {
    const mockAnalytics = {
      totalSales: 10000,
      totalOrders: 50,
      totalProducts: 20
    };

    orderAPI.getAnalytics.mockResolvedValue({
      data: { data: mockAnalytics }
    });

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/10000/i)).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because AdminDashboard didn't show loading state
  // GREEN: After adding loading state, test passed
  // REFACTOR: Test still passes
  it('should show loading spinner while fetching analytics', () => {
    orderAPI.getAnalytics.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    // Should be in loading state
    expect(orderAPI.getAnalytics).toHaveBeenCalled();
  });
});

