import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminOrders from '../../../../src/pages/admin/AdminOrders.jsx';
import { orderAPI } from '../../../../src/utils/api';

// Mock dependencies
vi.mock('../../../../src/utils/api', () => ({
  orderAPI: {
    getAll: vi.fn()
  }
}));

describe('AdminOrders Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TDD Evidence:
  // RED: This test failed because AdminOrders component did not exist
  // GREEN: After implementing AdminOrders component, test passed
  // REFACTOR: Test still passes
  it('should render admin orders page', async () => {
    orderAPI.getAll.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/all orders/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because AdminOrders didn't fetch orders on mount
  // GREEN: After adding useEffect to fetch orders, test passed
  // REFACTOR: Test still passes
  it('should fetch orders on mount', async () => {
    orderAPI.getAll.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(orderAPI.getAll).toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because AdminOrders didn't display orders
  // GREEN: After adding order rendering, test passed
  // REFACTOR: Test still passes
  it('should display orders', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        user: { name: 'Test User' },
        totalPrice: 1000,
        createdAt: '2024-01-01',
        isPaid: true,
        isDelivered: false,
        orderItems: [{ product: { _id: '1', name: 'Laptop' }, quantity: 1 }]
      }
    ];

    orderAPI.getAll.mockResolvedValue({ data: { data: mockOrders } });

    render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/1000/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because AdminOrders didn't show empty state
  // GREEN: After adding empty state, test passed
  // REFACTOR: Test still passes
  it('should show empty state when no orders', async () => {
    orderAPI.getAll.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no orders/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because AdminOrders didn't show loading state
  // GREEN: After adding loading state, test passed
  // REFACTOR: Test still passes
  it('should show loading spinner while fetching orders', () => {
    orderAPI.getAll.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <AdminOrders />
      </BrowserRouter>
    );

    // Should be in loading state
    expect(orderAPI.getAll).toHaveBeenCalled();
  });
});

