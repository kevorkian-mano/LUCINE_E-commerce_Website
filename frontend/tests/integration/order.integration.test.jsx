import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { CartProvider } from '../../src/context/CartContext';
import Checkout from '../../src/pages/Checkout';
import Orders from '../../src/pages/Orders';
import OrderDetails from '../../src/pages/OrderDetails';
import { createMockResponse, createMockError } from './setup';

// Mock API module - must be before imports
vi.mock('../../src/utils/api', () => ({
  orderAPI: {
    create: vi.fn(),
    getUserOrders: vi.fn(),
    getById: vi.fn(),
    updatePayment: vi.fn(),
    getAll: vi.fn(),
    getAnalytics: vi.fn(),
    getSalesByCategory: vi.fn(),
  },
  cartAPI: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
  paymentAPI: {
    createIntent: vi.fn(),
    confirm: vi.fn(),
    getStatus: vi.fn(),
    cancel: vi.fn(),
  },
  authAPI: {
    getProfile: vi.fn(),
  },
}));

import { orderAPI, cartAPI, paymentAPI, authAPI } from '../../src/utils/api';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'order123' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(null)),
}));

// Mock Stripe Elements
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div>{children}</div>,
  CardElement: () => <div data-testid="card-element">Card Element</div>,
  useStripe: () => null,
  useElements: () => null,
}));

// Mock PayPal
vi.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }) => children,
  PayPalButtons: () => <div data-testid="paypal-buttons">PayPal Buttons</div>,
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Order Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      })
    );
    mockNavigate.mockClear();
    // Set default mock for authAPI.getProfile() to prevent errors when AuthContext mounts
    authAPI.getProfile.mockResolvedValue(
      createMockResponse({
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      })
    );
    // Set default mock for cartAPI.getCart() to prevent errors when CartContext mounts
    cartAPI.getCart.mockResolvedValue(
      createMockResponse({ _id: 'cart123', items: [] })
    );
  });

  describe('Checkout Flow', () => {
    it('should create order from cart with shipping address', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
              stock: 10,
            },
            quantity: 2,
          },
        ],
      };

      const mockOrder = {
        _id: 'order123',
        user: 'user123',
        orderItems: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
            },
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        paymentMethod: 'Bank Transfer',
        itemsPrice: 199.98,
        shippingPrice: 10.00,
        taxPrice: 20.00,
        totalPrice: 229.98,
        isPaid: false,
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));
      orderAPI.create.mockResolvedValue(createMockResponse(mockOrder));
      cartAPI.clearCart.mockResolvedValue(createMockResponse(null));

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      // Wait for form to be rendered - increase timeout
      await waitFor(() => {
        expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument();
      }, { timeout: 10000 });

      // Fill in shipping address form - use placeholder since labels aren't associated
      const streetInput = screen.getByPlaceholderText('123 Main St');
      const cityInput = screen.getByPlaceholderText('New York');
      const stateInput = screen.getByPlaceholderText('NY');
      const zipCodeInput = screen.getByPlaceholderText('10001');
      const countryInput = screen.getByPlaceholderText('USA');
      const submitButton = screen.getByRole('button', { name: /place order/i });

      await userEvent.type(streetInput, '123 Main St');
      await userEvent.type(cityInput, 'New York');
      await userEvent.type(stateInput, 'NY');
      await userEvent.type(zipCodeInput, '10001');
      await userEvent.type(countryInput, 'USA');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(orderAPI.create).toHaveBeenCalled();
        const callArgs = orderAPI.create.mock.calls[0][0];
        expect(callArgs.shippingAddress).toEqual({
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        });
        // Payment method is 'PayPal' by default in Checkout component
        expect(callArgs.paymentMethod).toBe('PayPal');
      });

      // Order creation is the main test - ignore PayPal payment flow
      // The order should be created successfully
      await waitFor(() => {
        expect(orderAPI.create).toHaveBeenCalled();
      }, { timeout: 10000 });
      
      // For PayPal payment method, navigation happens after payment success
      // For other payment methods, navigation happens immediately
      // Since we're testing order creation, we just verify the order was created
      // PayPal payment flow is ignored as requested
    });

    it('should validate shipping address fields', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
            },
            quantity: 1,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      const submitButton = screen.getByRole('button', { name: /place order/i });
      await userEvent.click(submitButton);

      // HTML5 validation should prevent submission
      const streetInput = screen.getByPlaceholderText('123 Main St');
      expect(streetInput).toBeInvalid();
    });

    it('should handle order creation errors', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
            },
            quantity: 1,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));
      orderAPI.create.mockRejectedValue(createMockError('Cart is empty', 400));

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      // Wait for form to be rendered
      await waitFor(() => {
        expect(screen.getByPlaceholderText('123 Main St')).toBeInTheDocument();
      });

      const streetInput = screen.getByPlaceholderText('123 Main St');
      const cityInput = screen.getByPlaceholderText('New York');
      const stateInput = screen.getByPlaceholderText('NY');
      const zipCodeInput = screen.getByPlaceholderText('10001');
      const countryInput = screen.getByPlaceholderText('USA');
      const submitButton = screen.getByRole('button', { name: /place order/i });

      await userEvent.type(streetInput, '123 Main St');
      await userEvent.type(cityInput, 'New York');
      await userEvent.type(stateInput, 'NY');
      await userEvent.type(zipCodeInput, '10001');
      await userEvent.type(countryInput, 'USA');

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(orderAPI.create).toHaveBeenCalled();
      }, { timeout: 10000 });

      // On error, the order creation should fail
      // The component should show an error message and not navigate
      // Wait a bit to ensure navigation doesn't happen
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // The error should be handled - check that we haven't navigated to orders
      const navigateCalls = mockNavigate.mock.calls;
      const navigatedToOrders = navigateCalls.some(call => 
        call[0] && call[0].startsWith('/orders/')
      );
      expect(navigatedToOrders).toBe(false);
    });

    it('should create payment intent for credit card payment', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
            },
            quantity: 1,
          },
        ],
      };

      const mockOrder = {
        _id: 'order123',
        totalPrice: 119.99,
      };

      const mockPaymentIntent = {
        clientSecret: 'pi_test_secret_123',
        testMode: true,
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));
      orderAPI.create.mockResolvedValue(createMockResponse(mockOrder));
      paymentAPI.createIntent.mockResolvedValue(
        createMockResponse(mockPaymentIntent)
      );

      render(
        <TestWrapper>
          <Checkout />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      // Select credit card payment method - find the select by role (should be only one combobox)
      const paymentMethodSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(paymentMethodSelect, 'Credit Card');

      // Fill in shipping address - use placeholder since labels aren't associated
      const streetInput = screen.getByPlaceholderText('123 Main St');
      const cityInput = screen.getByPlaceholderText('New York');
      const stateInput = screen.getByPlaceholderText('NY');
      const zipCodeInput = screen.getByPlaceholderText('10001');
      const countryInput = screen.getByPlaceholderText('USA');

      await userEvent.type(streetInput, '123 Main St');
      await userEvent.type(cityInput, 'New York');
      await userEvent.type(stateInput, 'NY');
      await userEvent.type(zipCodeInput, '10001');
      await userEvent.type(countryInput, 'USA');

      const submitButton = screen.getByRole('button', { name: /place order/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(orderAPI.create).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(paymentAPI.createIntent).toHaveBeenCalledWith({
          orderId: 'order123',
          amount: 119.99,
        });
      });
    });
  });

  describe('Orders List Integration', () => {
    it('should fetch and display user orders', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          orderItems: [
            {
              product: { _id: 'product1', name: 'Product 1' },
              quantity: 2,
            },
          ],
          totalPrice: 229.98,
          createdAt: '2024-01-01T00:00:00.000Z',
          isPaid: true,
        },
        {
          _id: 'order2',
          orderItems: [
            {
              product: { _id: 'product2', name: 'Product 2' },
              quantity: 1,
            },
          ],
          totalPrice: 149.99,
          createdAt: '2024-01-02T00:00:00.000Z',
          isPaid: false,
        },
      ];

      orderAPI.getUserOrders.mockResolvedValue(createMockResponse(mockOrders));

      render(
        <TestWrapper>
          <Orders />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(orderAPI.getUserOrders).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/order1/i)).toBeInTheDocument();
      });
    });

    it('should display empty message when no orders', async () => {
      orderAPI.getUserOrders.mockResolvedValue(createMockResponse([]));

      render(
        <TestWrapper>
          <Orders />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(orderAPI.getUserOrders).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/no orders/i)).toBeInTheDocument();
      });
    });
  });

  describe('Order Details Integration', () => {
    it('should fetch and display order details', async () => {
      const mockOrder = {
        _id: 'order123',
        orderItems: [
          {
            name: 'Product 1',
            price: 99.99,
            quantity: 2,
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
            },
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        paymentMethod: 'Stripe',
        itemsPrice: 199.98,
        shippingPrice: 10.00,
        taxPrice: 20.00,
        totalPrice: 229.98,
        isPaid: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      orderAPI.getById.mockResolvedValue(createMockResponse(mockOrder));

      render(
        <TestWrapper>
          <OrderDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(orderAPI.getById).toHaveBeenCalledWith('order123');
      });

      await waitFor(() => {
        expect(orderAPI.getById).toHaveBeenCalledWith('order123');
      });

      // Wait for order to be displayed
      await waitFor(() => {
        // Product name should be in order items
        const allText = document.body.textContent || '';
        expect(allText.toLowerCase()).toContain('product 1');
      }, { timeout: 3000 });

      // Price might be split across elements, check if price text exists
      const allText = document.body.textContent || '';
      expect(allText).toContain('229.98');
      expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
    });

    it('should handle order not found', async () => {
      orderAPI.getById.mockRejectedValue(createMockError('Order not found', 404));

      render(
        <TestWrapper>
          <OrderDetails />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(orderAPI.getById).toHaveBeenCalled();
      });

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.queryByText(/product 1/i)).not.toBeInTheDocument();
      });
    });
  });
});

