import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { CartProvider, useCart } from '../../../src/context/CartContext.jsx';
import { AuthProvider } from '../../../src/context/AuthContext.jsx';
import { cartAPI } from '../../../src/utils/api';
import { toast } from 'react-toastify';

// Mock dependencies
vi.mock('../../../src/utils/api', () => ({
  cartAPI: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn()
  }
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock AuthContext properly
const mockUseAuth = vi.fn(() => ({ user: { id: '123' }, loading: false }));

vi.mock('../../../src/context/AuthContext.jsx', async () => {
  const actual = await vi.importActual('../../../src/context/AuthContext.jsx');
  return {
    ...actual,
    useAuth: () => mockUseAuth()
  };
});

// Test component that uses CartContext
const TestComponent = () => {
  const { cart, loading, addToCart, updateCartItem, removeFromCart, clearCart, cartItemCount, cartTotal } = useCart();
  
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div data-testid="cart">{cart ? JSON.stringify(cart) : 'No cart'}</div>
          <div data-testid="cartItemCount">{cartItemCount}</div>
          <div data-testid="cartTotal">{cartTotal}</div>
          <button onClick={() => addToCart('product123', 2)}>Add to Cart</button>
          <button onClick={() => updateCartItem('product123', 3)}>Update Cart</button>
          <button onClick={() => removeFromCart('product123')}>Remove from Cart</button>
          <button onClick={() => clearCart()}>Clear Cart</button>
        </div>
      )}
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // TDD Evidence:
  // RED: This test failed because CartContext did not fetch cart on mount
  // GREEN: After adding useEffect to fetch cart when user exists, test passed
  // REFACTOR: Improved error handling, test still passes
  it('should fetch cart when user is authenticated', async () => {
    const mockCart = {
      _id: 'cart123',
      user: 'user123',
      items: []
    };
    
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    cartAPI.getCart.mockResolvedValue({
      data: { data: mockCart }
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(cartAPI.getCart).toHaveBeenCalled();
      expect(screen.getByTestId('cart')).toHaveTextContent('cart123');
    }, { timeout: 3000 });
  });

  // TDD Evidence:
  // RED: This test failed because CartContext didn't clear cart when user logs out
  // GREEN: After adding useEffect to clear cart when user is null, test passed
  // REFACTOR: Test still passes
  it('should clear cart when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart')).toHaveTextContent('No cart');
    });
  });

  // TDD Evidence:
  // RED: This test failed because addToCart function did not exist
  // GREEN: After implementing addToCart, test passed
  // REFACTOR: Improved error handling, test still passes
  it('should add item to cart successfully', async () => {
    const mockCart = {
      _id: 'cart123',
      items: [{ product: { _id: 'product123', price: 10 }, quantity: 2 }]
    };
    
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    cartAPI.getCart.mockResolvedValue({
      data: { data: { _id: 'cart123', items: [] } }
    });
    
    cartAPI.addItem.mockResolvedValue({
      data: { data: mockCart }
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(cartAPI.getCart).toHaveBeenCalled();
    });

    const addButton = screen.getByText('Add to Cart');
    
    await act(async () => {
      addButton.click();
    });

    await waitFor(() => {
      expect(cartAPI.addItem).toHaveBeenCalledWith({ productId: 'product123', quantity: 2 });
      expect(toast.success).toHaveBeenCalledWith('Item added to cart!');
    });
  });

  // TDD Evidence:
  // RED: This test failed because addToCart didn't handle errors
  // GREEN: After adding try-catch, test passed
  // REFACTOR: Improved error handling, test still passes
  it('should handle errors when adding item to cart', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    cartAPI.getCart.mockResolvedValue({
      data: { data: { _id: 'cart123', items: [] } }
    });
    
    cartAPI.addItem.mockRejectedValue({
      response: { data: { message: 'Product not found' } }
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(cartAPI.getCart).toHaveBeenCalled();
    });

    const addButton = screen.getByText('Add to Cart');
    
    await act(async () => {
      addButton.click();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Product not found');
    });
  });

  // TDD Evidence:
  // RED: This test failed because updateCartItem function did not exist
  // GREEN: After implementing updateCartItem, test passed
  // REFACTOR: Test still passes
  it('should update cart item quantity', async () => {
    const mockCart = {
      _id: 'cart123',
      items: [{ product: { _id: 'product123', price: 10 }, quantity: 3 }]
    };
    
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    cartAPI.getCart.mockResolvedValue({
      data: { data: { _id: 'cart123', items: [] } }
    });
    
    cartAPI.updateItem.mockResolvedValue({
      data: { data: mockCart }
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(cartAPI.getCart).toHaveBeenCalled();
    });

    const updateButton = screen.getByText('Update Cart');
    
    await act(async () => {
      updateButton.click();
    });

    await waitFor(() => {
      expect(cartAPI.updateItem).toHaveBeenCalledWith('product123', 3);
      expect(toast.success).toHaveBeenCalledWith('Cart updated!');
    });
  });

  // TDD Evidence:
  // RED: This test failed because removeFromCart function did not exist
  // GREEN: After implementing removeFromCart, test passed
  // REFACTOR: Test still passes
  it('should remove item from cart', async () => {
    const mockCart = {
      _id: 'cart123',
      items: []
    };
    
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    cartAPI.getCart.mockResolvedValue({
      data: { data: { _id: 'cart123', items: [] } }
    });
    
    cartAPI.removeItem.mockResolvedValue({
      data: { data: mockCart }
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(cartAPI.getCart).toHaveBeenCalled();
    });

    const removeButton = screen.getByText('Remove from Cart');
    
    await act(async () => {
      removeButton.click();
    });

    await waitFor(() => {
      expect(cartAPI.removeItem).toHaveBeenCalledWith('product123');
      expect(toast.success).toHaveBeenCalledWith('Item removed from cart!');
    });
  });

  // TDD Evidence:
  // RED: This test failed because clearCart function did not exist
  // GREEN: After implementing clearCart, test passed
  // REFACTOR: Test still passes
  it('should clear cart', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '123' }, loading: false });
    cartAPI.getCart.mockResolvedValue({
      data: { data: { _id: 'cart123', items: [] } }
    });
    
    cartAPI.clearCart.mockResolvedValue({});

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(cartAPI.getCart).toHaveBeenCalled();
    });

    const clearButton = screen.getByText('Clear Cart');
    
    await act(async () => {
      clearButton.click();
    });

    await waitFor(() => {
      expect(cartAPI.clearCart).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Cart cleared!');
    });
  });

  // TDD Evidence:
  // RED: This test failed because cartItemCount did not calculate correctly
  // GREEN: After implementing cartItemCount calculation, test passed
  // REFACTOR: Test still passes
  it('should calculate cart item count correctly', async () => {
    const mockCart = {
      _id: 'cart123',
      items: [
        { product: { _id: 'product1' }, quantity: 2 },
        { product: { _id: 'product2' }, quantity: 3 }
      ]
    };
    
    cartAPI.getCart.mockResolvedValue({
      data: { data: mockCart }
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cartItemCount')).toHaveTextContent('5');
    });
  });

  // TDD Evidence:
  // RED: This test failed because cartTotal did not calculate correctly
  // GREEN: After implementing cartTotal calculation, test passed
  // REFACTOR: Test still passes
  it('should calculate cart total correctly', async () => {
    const mockCart = {
      _id: 'cart123',
      items: [
        { product: { _id: 'product1', price: 10 }, quantity: 2 },
        { product: { _id: 'product2', price: 20 }, quantity: 3 }
      ]
    };
    
    cartAPI.getCart.mockResolvedValue({
      data: { data: mockCart }
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cartTotal')).toHaveTextContent('80');
    });
  });
});

