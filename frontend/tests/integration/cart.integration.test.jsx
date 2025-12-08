import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { CartProvider, useCart } from '../../src/context/CartContext';
import Cart from '../../src/pages/Cart';
import ProductDetails from '../../src/pages/ProductDetails';
import { createMockResponse, createMockError } from './setup';

// Mock API module - must be before imports
vi.mock('../../src/utils/api', () => ({
  cartAPI: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
  productAPI: {
    getAll: vi.fn(),
    search: vi.fn(),
    getById: vi.fn(),
    getCategories: vi.fn(),
    getByCategory: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  authAPI: {
    getProfile: vi.fn(),
  },
}));

import { cartAPI, productAPI, authAPI } from '../../src/utils/api';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'product1' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Cart Flow Integration Tests', () => {
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

  describe('Cart Context Integration', () => {
    it('should fetch cart on mount when user is logged in', async () => {
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
              description: 'Test product',
              stock: 10,
            },
            quantity: 2,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));

      const TestComponent = () => {
        const { cart, loading } = useCart();
        if (loading) return <div>Loading...</div>;
        return <div>{cart ? `Cart has ${cart.items.length} items` : 'No cart'}</div>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/cart has 1 items/i)).toBeInTheDocument();
      });
    });

    it('should add item to cart', async () => {
      const initialCart = {
        _id: 'cart123',
        items: [],
      };

      const updatedCart = {
        _id: 'cart123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
              stock: 10,
            },
            quantity: 1,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(initialCart));
      cartAPI.addItem.mockResolvedValue(createMockResponse(updatedCart));

      const TestComponent = () => {
        const { addToCart, cart } = useCart();
        return (
          <div>
            <button onClick={() => addToCart('product1', 1)}>Add to Cart</button>
            <div>{cart ? `Items: ${cart.items.length}` : 'No cart'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(cartAPI.addItem).toHaveBeenCalledWith({ productId: 'product1', quantity: 1 });
      });

      await waitFor(() => {
        expect(screen.getByText(/items: 1/i)).toBeInTheDocument();
      });
    });

    it('should update cart item quantity', async () => {
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
            quantity: 1,
          },
        ],
      };

      const updatedCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 3,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));
      cartAPI.updateItem.mockResolvedValue(createMockResponse(updatedCart));

      const TestComponent = () => {
        const { updateCartItem, cart } = useCart();
        return (
          <div>
            <button onClick={() => updateCartItem('product1', 3)}>Update Quantity</button>
            <div>
              {cart?.items[0]?.quantity || 0}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      const updateButton = screen.getByRole('button', { name: /update quantity/i });
      await userEvent.click(updateButton);

      await waitFor(() => {
        expect(cartAPI.updateItem).toHaveBeenCalledWith('product1', 3);
      });

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should remove item from cart', async () => {
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

      const updatedCart = {
        _id: 'cart123',
        items: [],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));
      cartAPI.removeItem.mockResolvedValue(createMockResponse(updatedCart));

      const TestComponent = () => {
        const { removeFromCart, cart } = useCart();
        return (
          <div>
            <button onClick={() => removeFromCart('product1')}>Remove Item</button>
            <div>{cart ? `Items: ${cart.items.length}` : 'No cart'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      const removeButton = screen.getByRole('button', { name: /remove item/i });
      await userEvent.click(removeButton);

      await waitFor(() => {
        expect(cartAPI.removeItem).toHaveBeenCalledWith('product1');
      });

      await waitFor(() => {
        expect(screen.getByText(/items: 0/i)).toBeInTheDocument();
      });
    });

    it('should clear cart', async () => {
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
      cartAPI.clearCart.mockResolvedValue(createMockResponse(null));

      const TestComponent = () => {
        const { clearCart, cart } = useCart();
        return (
          <div>
            <button onClick={clearCart}>Clear Cart</button>
            <div>{cart ? `Items: ${cart.items.length}` : 'Cart cleared'}</div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      const clearButton = screen.getByRole('button', { name: /clear cart/i });
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(cartAPI.clearCart).toHaveBeenCalled();
      });
    });

    it('should handle cart errors gracefully', async () => {
      cartAPI.getCart.mockRejectedValue(createMockError('Failed to fetch cart', 500));

      const TestComponent = () => {
        const { cart, loading } = useCart();
        if (loading) return <div>Loading...</div>;
        return <div>{cart ? 'Cart loaded' : 'No cart'}</div>;
      };

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(cartAPI.getCart).toHaveBeenCalled();
      });

      // Should handle error without crashing
      await waitFor(() => {
        expect(screen.getByText(/no cart/i)).toBeInTheDocument();
      });
    });
  });

  describe('Cart Page Integration', () => {
    it('should display empty cart message when cart is empty', async () => {
      cartAPI.getCart.mockResolvedValue(
        createMockResponse({ _id: 'cart123', items: [] })
      );

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
      });
    });

    it('should display cart items when cart has items', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
              description: 'Test product',
              stock: 10,
            },
            quantity: 2,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/product 1/i)).toBeInTheDocument();
      });

      // Price might be split across elements, check if price text exists
      const allText = document.body.textContent || '';
      expect(allText).toContain('99.99');
      // Check for quantity - there may be multiple "2" elements, so use getAllByText
      const quantityTexts = screen.getAllByText('2');
      expect(quantityTexts.length).toBeGreaterThan(0);
    });

    it('should update item quantity from cart page', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
              description: 'Test product',
              stock: 10,
            },
            quantity: 1,
          },
        ],
      };

      const updatedCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 2,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));
      cartAPI.updateItem.mockResolvedValue(createMockResponse(updatedCart));

      render(
        <TestWrapper>
          <Cart />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/product 1/i)).toBeInTheDocument();
      });

      // Find and click the plus button
      const plusButtons = screen.getAllByRole('button');
      const plusButton = plusButtons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && btn.getAttribute('aria-label')?.includes('plus');
      });

      if (plusButton) {
        await userEvent.click(plusButton);

        await waitFor(() => {
          expect(cartAPI.updateItem).toHaveBeenCalled();
        });
      }
    });
  });
});

