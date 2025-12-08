import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { CartProvider } from '../../src/context/CartContext';
import { createMockResponse, createMockError } from './setup';

// Mock API module - must be before imports
vi.mock('../../src/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  },
  authAPI: {
    register: vi.fn(),
    login: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn(),
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
  cartAPI: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
  orderAPI: {
    create: vi.fn(),
    getUserOrders: vi.fn(),
    getById: vi.fn(),
    updatePayment: vi.fn(),
    getAll: vi.fn(),
    getAnalytics: vi.fn(),
    getSalesByCategory: vi.fn(),
  },
  paymentAPI: {
    createIntent: vi.fn(),
    confirm: vi.fn(),
    getStatus: vi.fn(),
    cancel: vi.fn(),
  },
  paypalAPI: {
    createOrder: vi.fn(),
    captureOrder: vi.fn(),
    getOrderStatus: vi.fn(),
  },
}));

import api, { authAPI, productAPI, cartAPI, orderAPI } from '../../src/utils/api';

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Authentication API Integration', () => {
    it('should register a new user and store token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
      const mockToken = 'test-token-123';

      authAPI.register.mockResolvedValue(
        createMockResponse({ user: mockUser, token: mockToken })
      );

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await authAPI.register(userData);

      expect(authAPI.register).toHaveBeenCalledWith(userData);
      expect(response.data.success).toBe(true);
      expect(response.data.data.user).toEqual(mockUser);
      expect(response.data.data.token).toBe(mockToken);
    });

    it('should login user and return token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
      const mockToken = 'test-token-123';

      authAPI.login.mockResolvedValue(
        createMockResponse({ user: mockUser, token: mockToken })
      );

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await authAPI.login(loginData);

      expect(authAPI.login).toHaveBeenCalledWith(loginData);
      expect(response.data.success).toBe(true);
      expect(response.data.data.user).toEqual(mockUser);
      expect(response.data.data.token).toBe(mockToken);
    });

    it('should handle login errors', async () => {
      authAPI.login.mockRejectedValue(
        createMockError('Invalid credentials', 401)
      );

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authAPI.login(loginData)).rejects.toThrow();
    });

    it('should get user profile with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };

      localStorage.setItem('token', 'valid-token');
      authAPI.getProfile.mockResolvedValue(createMockResponse(mockUser));

      const response = await authAPI.getProfile();

      expect(authAPI.getProfile).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockUser);
    });
  });

  describe('Product API Integration', () => {
    it('should fetch all products', async () => {
      const mockProducts = [
        {
          _id: 'product1',
          name: 'Product 1',
          price: 99.99,
          category: 'Electronics',
        },
        {
          _id: 'product2',
          name: 'Product 2',
          price: 149.99,
          category: 'Clothing',
        },
      ];

      productAPI.getAll.mockResolvedValue(createMockResponse(mockProducts));

      const response = await productAPI.getAll();

      expect(productAPI.getAll).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockProducts);
    });

    it('should search products with query', async () => {
      const mockProducts = [
        {
          _id: 'product1',
          name: 'Laptop',
          price: 999.99,
        },
      ];

      productAPI.search.mockResolvedValue(createMockResponse(mockProducts));

      const params = { q: 'laptop' };
      const response = await productAPI.search(params);

      expect(productAPI.search).toHaveBeenCalledWith(params);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockProducts);
    });

    it('should get product by ID', async () => {
      const mockProduct = {
        _id: 'product1',
        name: 'Product 1',
        price: 99.99,
        description: 'Test description',
      };

      productAPI.getById.mockResolvedValue(createMockResponse(mockProduct));

      const response = await productAPI.getById('product1');

      expect(productAPI.getById).toHaveBeenCalledWith('product1');
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockProduct);
    });

    it('should get product categories', async () => {
      const mockCategories = ['Electronics', 'Clothing', 'Books'];

      productAPI.getCategories.mockResolvedValue(
        createMockResponse(mockCategories)
      );

      const response = await productAPI.getCategories();

      expect(productAPI.getCategories).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockCategories);
    });
  });

  describe('Cart API Integration', () => {
    it('should get user cart', async () => {
      const mockCart = {
        _id: 'cart123',
        user: 'user123',
        items: [
          {
            product: {
              _id: 'product1',
              name: 'Product 1',
              price: 99.99,
            },
            quantity: 2,
          },
        ],
      };

      cartAPI.getCart.mockResolvedValue(createMockResponse(mockCart));

      const response = await cartAPI.getCart();

      expect(cartAPI.getCart).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockCart);
    });

    it('should add item to cart', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: { _id: 'product1', name: 'Product 1', price: 99.99 },
            quantity: 1,
          },
        ],
      };

      cartAPI.addItem.mockResolvedValue(createMockResponse(mockCart));

      const itemData = { productId: 'product1', quantity: 1 };
      const response = await cartAPI.addItem(itemData);

      expect(cartAPI.addItem).toHaveBeenCalledWith(itemData);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockCart);
    });

    it('should update cart item quantity', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [
          {
            product: { _id: 'product1', name: 'Product 1', price: 99.99 },
            quantity: 3,
          },
        ],
      };

      cartAPI.updateItem.mockResolvedValue(createMockResponse(mockCart));

      const response = await cartAPI.updateItem('product1', 3);

      expect(cartAPI.updateItem).toHaveBeenCalledWith('product1', 3);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockCart);
    });

    it('should remove item from cart', async () => {
      const mockCart = {
        _id: 'cart123',
        items: [],
      };

      cartAPI.removeItem.mockResolvedValue(createMockResponse(mockCart));

      const response = await cartAPI.removeItem('product1');

      expect(cartAPI.removeItem).toHaveBeenCalledWith('product1');
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockCart);
    });

    it('should clear cart', async () => {
      cartAPI.clearCart.mockResolvedValue(createMockResponse(null));

      const response = await cartAPI.clearCart();

      expect(cartAPI.clearCart).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
    });
  });

  describe('Order API Integration', () => {
    it('should create order from cart', async () => {
      const mockOrder = {
        _id: 'order123',
        user: 'user123',
        orderItems: [
          {
            product: { _id: 'product1', name: 'Product 1', price: 99.99 },
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
        paymentMethod: 'Stripe',
        totalPrice: 229.98,
      };

      orderAPI.create.mockResolvedValue(createMockResponse(mockOrder));

      const orderData = {
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        paymentMethod: 'Stripe',
      };

      const response = await orderAPI.create(orderData);

      expect(orderAPI.create).toHaveBeenCalledWith(orderData);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockOrder);
    });

    it('should get user orders', async () => {
      const mockOrders = [
        {
          _id: 'order1',
          orderItems: [],
          totalPrice: 99.99,
          createdAt: '2024-01-01',
        },
        {
          _id: 'order2',
          orderItems: [],
          totalPrice: 149.99,
          createdAt: '2024-01-02',
        },
      ];

      orderAPI.getUserOrders.mockResolvedValue(createMockResponse(mockOrders));

      const response = await orderAPI.getUserOrders();

      expect(orderAPI.getUserOrders).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockOrders);
    });

    it('should get order by ID', async () => {
      const mockOrder = {
        _id: 'order123',
        orderItems: [],
        totalPrice: 99.99,
      };

      orderAPI.getById.mockResolvedValue(createMockResponse(mockOrder));

      const response = await orderAPI.getById('order123');

      expect(orderAPI.getById).toHaveBeenCalledWith('order123');
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockOrder);
    });

    it('should handle order creation errors', async () => {
      orderAPI.create.mockRejectedValue(
        createMockError('Cart is empty', 400)
      );

      const orderData = {
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        paymentMethod: 'Stripe',
      };

      await expect(orderAPI.create(orderData)).rejects.toThrow();
    });
  });
});

