import { describe, it, expect, beforeEach, vi } from 'vitest';
import cartController from '../../../src/controllers/cartController.js';
import cartService from '../../../src/services/cartService.js';
import { mockCart } from '../../helpers/mockData.js';

// Mock cartService
vi.mock('../../../src/services/cartService.js', () => ({
  default: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateItemQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn()
  }
}));

describe('CartController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: { id: 'userId123' },
      body: {},
      params: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('getCart', () => {
    // TDD Evidence:
    // RED: This test failed because getCart controller method did not exist
    // GREEN: After implementing getCart, test passed
    // REFACTOR: Test still passes
    it('should return user cart', async () => {
      cartService.getCart.mockResolvedValue(mockCart);

      await cartController.getCart(req, res, next);

      expect(cartService.getCart).toHaveBeenCalledWith('userId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCart
      });
    });
  });

  describe('addItem', () => {
    // TDD Evidence:
    // RED: This test failed because addItem controller method did not exist
    // GREEN: After implementing addItem, test passed
    // REFACTOR: Test still passes
    it('should add item to cart', async () => {
      req.body = { productId: 'product123', quantity: 2 };
      cartService.addItem.mockResolvedValue(mockCart);

      await cartController.addItem(req, res, next);

      expect(cartService.addItem).toHaveBeenCalledWith('userId123', 'product123', 2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Item added to cart',
        data: mockCart
      });
    });

    // TDD Evidence:
    // RED: This test failed because addItem didn't use default quantity of 1
    // GREEN: After adding default quantity, test passed
    // REFACTOR: Test still passes
    it('should use default quantity of 1 if not provided', async () => {
      req.body = { productId: 'product123' };
      cartService.addItem.mockResolvedValue(mockCart);

      await cartController.addItem(req, res, next);

      expect(cartService.addItem).toHaveBeenCalledWith('userId123', 'product123', 1);
    });
  });

  describe('updateItemQuantity', () => {
    // TDD Evidence:
    // RED: This test failed because updateItemQuantity controller method did not exist
    // GREEN: After implementing updateItemQuantity, test passed
    // REFACTOR: Test still passes
    it('should update item quantity in cart', async () => {
      req.params.productId = 'product123';
      req.body.quantity = 5;
      cartService.updateItemQuantity.mockResolvedValue(mockCart);

      await cartController.updateItemQuantity(req, res, next);

      expect(cartService.updateItemQuantity).toHaveBeenCalledWith('userId123', 'product123', 5);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Cart updated',
        data: mockCart
      });
    });
  });

  describe('removeItem', () => {
    // TDD Evidence:
    // RED: This test failed because removeItem controller method did not exist
    // GREEN: After implementing removeItem, test passed
    // REFACTOR: Test still passes
    it('should remove item from cart', async () => {
      req.params.productId = 'product123';
      cartService.removeItem.mockResolvedValue(mockCart);

      await cartController.removeItem(req, res, next);

      expect(cartService.removeItem).toHaveBeenCalledWith('userId123', 'product123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Item removed from cart',
        data: mockCart
      });
    });
  });

  describe('clearCart', () => {
    // TDD Evidence:
    // RED: This test failed because clearCart controller method did not exist
    // GREEN: After implementing clearCart, test passed
    // REFACTOR: Test still passes
    it('should clear user cart', async () => {
      cartService.clearCart.mockResolvedValue({});

      await cartController.clearCart(req, res, next);

      expect(cartService.clearCart).toHaveBeenCalledWith('userId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Cart cleared',
        data: {}
      });
    });
  });
});

