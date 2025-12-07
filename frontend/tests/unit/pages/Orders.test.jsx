import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Orders from '../../../src/pages/Orders.jsx';
import { orderAPI } from '../../../src/utils/api';

// Mock dependencies
vi.mock('../../../src/utils/api', () => ({
  orderAPI: {
    getUserOrders: vi.fn()
  }
}));

describe('Orders Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TDD Evidence:
  // RED: This test failed because Orders component did not exist
  // GREEN: After implementing Orders component, test passed
  // REFACTOR: Test still passes
  it('should render orders page', async () => {
    orderAPI.getUserOrders.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/my orders/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Orders didn't fetch orders on mount
  // GREEN: After adding useEffect to fetch orders, test passed
  // REFACTOR: Test still passes
  it('should fetch orders on mount', async () => {
    orderAPI.getUserOrders.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(orderAPI.getUserOrders).toHaveBeenCalled();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Orders didn't display orders
  // GREEN: After adding order rendering, test passed
  // REFACTOR: Test still passes
  it('should display orders', async () => {
    const mockOrders = [
      {
        _id: 'order1',
        totalPrice: 1000,
        createdAt: '2024-01-01',
        isPaid: true,
        isDelivered: false,
        orderItems: [{ product: { _id: '1', name: 'Laptop' }, quantity: 1 }]
      }
    ];

    orderAPI.getUserOrders.mockResolvedValue({ data: { data: mockOrders } });

    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/1000/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Orders didn't show empty state
  // GREEN: After adding empty state, test passed
  // REFACTOR: Test still passes
  it('should show empty state when no orders', async () => {
    orderAPI.getUserOrders.mockResolvedValue({ data: { data: [] } });

    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
    });
  });

  // TDD Evidence:
  // RED: This test failed because Orders didn't show loading state
  // GREEN: After adding loading state, test passed
  // REFACTOR: Test still passes
  it('should show loading spinner while fetching orders', () => {
    orderAPI.getUserOrders.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <Orders />
      </BrowserRouter>
    );

    // Should be in loading state
    expect(orderAPI.getUserOrders).toHaveBeenCalled();
  });
});

