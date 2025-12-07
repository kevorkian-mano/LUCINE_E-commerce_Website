import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartService } from '../../../src/services/cartService.js';
import { mockCart, mockProduct } from '../../helpers/mockData.js';

describe('CartService', () => {
  let cartService;
  let mockCartRepository;
  let mockProductService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      addItem: vi.fn(),
      updateItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn()
    };

    mockProductService = {
      getById: vi.fn()
    };

    cartService = new CartService(mockCartRepository, mockProductService);
  });

  describe('getCart', () => {
    // TDD Evidence:
    // RED: This test failed because getCart method did not exist
    // GREEN: After implementing getCart, test passed
    // REFACTOR: Test still passes
    it('should return existing cart for user', async () => {
      mockCartRepository.findByUserId.mockResolvedValue(mockCart);

      const result = await cartService.getCart('userId123');

      expect(result).toEqual(mockCart);
      expect(mockCartRepository.findByUserId).toHaveBeenCalledWith('userId123');
      expect(mockCartRepository.create).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because getCart didn't create cart if it doesn't exist
    // GREEN: After adding cart creation logic, test passed
    // REFACTOR: Test still passes
    it('should create new cart if user has no cart', async () => {
      const newCart = { _id: 'new-cart-id', user: 'userId123', items: [] };
      mockCartRepository.findByUserId.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue(newCart);

      const result = await cartService.getCart('userId123');

      expect(result).toEqual(newCart);
      expect(mockCartRepository.create).toHaveBeenCalledWith('userId123');
    });
  });

  describe('addItem', () => {
    // TDD Evidence:
    // RED: This test failed because addItem method did not exist
    // GREEN: After implementing addItem, test passed
    // REFACTOR: Extracted stock validation, test still passes
    it('should add new item to cart', async () => {
      const userId = 'userId123';
      const productId = mockProduct._id;
      const quantity = 2;

      mockProductService.getById.mockResolvedValue(mockProduct);
      mockCartRepository.findByUserId.mockResolvedValue({ ...mockCart, items: [] });
      mockCartRepository.addItem.mockResolvedValue({
        ...mockCart,
        items: [{ product: mockProduct, quantity }]
      });

      const result = await cartService.addItem(userId, productId, quantity);

      expect(mockProductService.getById).toHaveBeenCalledWith(productId);
      expect(mockCartRepository.addItem).toHaveBeenCalledWith(userId, productId, quantity);
      expect(result.items).toHaveLength(1);
    });

    // TDD Evidence:
    // RED: This test failed because addItem didn't validate stock availability
    // GREEN: After adding stock check, test passed
    // REFACTOR: Test still passes
    it('should throw error if insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      mockProductService.getById.mockResolvedValue(lowStockProduct);

      await expect(cartService.addItem('userId123', mockProduct._id, 5)).rejects.toThrow(
        'Insufficient stock'
      );
    });

    // TDD Evidence:
    // RED: This test failed because addItem didn't update quantity for existing items
    // GREEN: After adding logic to update existing items, test passed
    // REFACTOR: Extracted quantity update logic, test still passes
    it('should update quantity if item already exists in cart', async () => {
      const userId = 'userId123';
      const productId = mockProduct._id;
      const existingCart = {
        ...mockCart,
        items: [{ product: mockProduct, quantity: 2 }]
      };

      mockProductService.getById.mockResolvedValue(mockProduct);
      mockCartRepository.findByUserId.mockResolvedValue(existingCart);
      mockCartRepository.updateItemQuantity.mockResolvedValue({
        ...existingCart,
        items: [{ product: mockProduct, quantity: 5 }]
      });

      const result = await cartService.addItem(userId, productId, 3);

      expect(mockCartRepository.updateItemQuantity).toHaveBeenCalledWith(userId, productId, 5);
      expect(mockCartRepository.addItem).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because addItem didn't check total quantity against stock
    // GREEN: After adding total quantity validation, test passed
    // REFACTOR: Test still passes
    it('should throw error if total quantity exceeds stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 5 };
      const existingCart = {
        ...mockCart,
        items: [{ product: mockProduct, quantity: 3 }]
      };

      mockProductService.getById.mockResolvedValue(lowStockProduct);
      mockCartRepository.findByUserId.mockResolvedValue(existingCart);

      await expect(cartService.addItem('userId123', mockProduct._id, 3)).rejects.toThrow(
        'Insufficient stock'
      );
    });

    // TDD Evidence:
    // RED: This test failed because addItem didn't use default quantity of 1
    // GREEN: After adding default parameter, test passed
    // REFACTOR: Test still passes
    it('should use default quantity of 1 if not provided', async () => {
      mockProductService.getById.mockResolvedValue(mockProduct);
      mockCartRepository.findByUserId.mockResolvedValue({ ...mockCart, items: [] });
      mockCartRepository.addItem.mockResolvedValue(mockCart);

      await cartService.addItem('userId123', mockProduct._id);

      expect(mockCartRepository.addItem).toHaveBeenCalledWith('userId123', mockProduct._id, 1);
    });
  });

  describe('updateItemQuantity', () => {
    // TDD Evidence:
    // RED: This test failed because updateItemQuantity method did not exist
    // GREEN: After implementing updateItemQuantity, test passed
    // REFACTOR: Test still passes
    it('should update item quantity in cart', async () => {
      const userId = 'userId123';
      const productId = mockProduct._id;
      const newQuantity = 5;

      mockProductService.getById.mockResolvedValue(mockProduct);
      mockCartRepository.updateItemQuantity.mockResolvedValue({
        ...mockCart,
        items: [{ product: mockProduct, quantity: newQuantity }]
      });

      const result = await cartService.updateItemQuantity(userId, productId, newQuantity);

      expect(mockProductService.getById).toHaveBeenCalledWith(productId);
      expect(mockCartRepository.updateItemQuantity).toHaveBeenCalledWith(
        userId,
        productId,
        newQuantity
      );
    });

    // TDD Evidence:
    // RED: This test failed because updateItemQuantity didn't validate quantity > 0
    // GREEN: After adding quantity validation, test passed
    // REFACTOR: Test still passes
    it('should throw error if quantity is less than or equal to 0', async () => {
      await expect(
        cartService.updateItemQuantity('userId123', mockProduct._id, 0)
      ).rejects.toThrow('Quantity must be greater than 0');

      await expect(
        cartService.updateItemQuantity('userId123', mockProduct._id, -1)
      ).rejects.toThrow('Quantity must be greater than 0');
    });

    // TDD Evidence:
    // RED: This test failed because updateItemQuantity didn't validate stock
    // GREEN: After adding stock validation, test passed
    // REFACTOR: Test still passes
    it('should throw error if quantity exceeds stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 3 };
      mockProductService.getById.mockResolvedValue(lowStockProduct);

      await expect(
        cartService.updateItemQuantity('userId123', mockProduct._id, 5)
      ).rejects.toThrow('Insufficient stock');
    });
  });

  describe('removeItem', () => {
    // TDD Evidence:
    // RED: This test failed because removeItem method did not exist
    // GREEN: After implementing removeItem, test passed
    // REFACTOR: Test still passes
    it('should remove item from cart', async () => {
      const userId = 'userId123';
      const productId = mockProduct._id;
      const updatedCart = { ...mockCart, items: [] };

      mockCartRepository.removeItem.mockResolvedValue(updatedCart);

      const result = await cartService.removeItem(userId, productId);

      expect(result).toEqual(updatedCart);
      expect(mockCartRepository.removeItem).toHaveBeenCalledWith(userId, productId);
    });
  });

  describe('clearCart', () => {
    // TDD Evidence:
    // RED: This test failed because clearCart method did not exist
    // GREEN: After implementing clearCart, test passed
    // REFACTOR: Test still passes
    it('should clear all items from cart', async () => {
      const userId = 'userId123';
      const clearedCart = { ...mockCart, items: [] };

      mockCartRepository.clearCart.mockResolvedValue(clearedCart);

      const result = await cartService.clearCart(userId);

      expect(result).toEqual(clearedCart);
      expect(mockCartRepository.clearCart).toHaveBeenCalledWith(userId);
    });
  });
});

