import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartRepository } from '../../../src/repositories/cartRepository.js';
import Cart from '../../../src/models/Cart.js';
import { mockCart, mockProduct } from '../../helpers/mockData.js';

// Mock Cart model
vi.mock('../../../src/models/Cart.js', () => {
  const mockCartConstructor = vi.fn();
  mockCartConstructor.findOne = vi.fn();
  mockCartConstructor.findById = vi.fn();
  mockCartConstructor.findOneAndUpdate = vi.fn();
  return {
    default: mockCartConstructor
  };
});

describe('CartRepository', () => {
  let cartRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    cartRepository = new CartRepository();
  });

  describe('findByUserId', () => {
    // TDD Evidence:
    // RED: This test failed because findByUserId method did not exist
    // GREEN: After implementing findByUserId, test passed
    // REFACTOR: Added populate for product details, test still passes
    it('should find cart by user id with populated products', async () => {
      const mockFindOne = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCart)
      });
      Cart.findOne = mockFindOne;

      const result = await cartRepository.findByUserId('userId123');

      expect(result).toEqual(mockCart);
      expect(mockFindOne).toHaveBeenCalledWith({ user: 'userId123' });
    });
  });

  describe('create', () => {
    // TDD Evidence:
    // RED: This test failed because create method did not exist
    // GREEN: After implementing create, test passed
    // REFACTOR: Test still passes
    it('should create new cart for user', async () => {
      const newCart = { _id: 'new-cart-id', user: 'userId123', items: [] };
      const mockSave = vi.fn().mockResolvedValue(newCart);
      Cart.mockImplementation(() => ({
        save: mockSave
      }));

      const result = await cartRepository.create('userId123');

      expect(Cart).toHaveBeenCalledWith({ user: 'userId123', items: [] });
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('addItem', () => {
    // TDD Evidence:
    // RED: This test failed because addItem method did not exist
    // GREEN: After implementing addItem, test passed
    // REFACTOR: Improved logic for existing items, test still passes
    it('should add new item to existing cart', async () => {
      // Mock findOneAndUpdate for increment (returns null when item doesn't exist)
      // Need to return chainable object with populate that resolves to null
      const mockFindOneAndUpdateIncrement = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(null)
      });
      // Mock findOneAndUpdate for push (adds new item)
      const mockFindOneAndUpdatePush = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockCart)
      });
      
      Cart.findOneAndUpdate = vi.fn()
        .mockImplementationOnce(() => mockFindOneAndUpdateIncrement())
        .mockImplementationOnce(() => mockFindOneAndUpdatePush());

      const result = await cartRepository.addItem('userId123', mockProduct._id, 2);

      expect(Cart.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCart);
    });

    // TDD Evidence:
    // RED: This test failed because addItem didn't update quantity for existing items
    // GREEN: After adding logic to update existing items, test passed
    // REFACTOR: Test still passes
    it('should update quantity if item already exists in cart', async () => {
      // Mock findOneAndUpdate for increment (item exists, so returns updated cart)
      const updatedCart = {
        ...mockCart,
        items: [{ product: mockProduct, quantity: 3 }]
      };
      const mockFindOneAndUpdateIncrement = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(updatedCart)
      });
      
      Cart.findOneAndUpdate = vi.fn()
        .mockImplementationOnce(() => mockFindOneAndUpdateIncrement());

      const result = await cartRepository.addItem('userId123', mockProduct._id, 2);

      expect(Cart.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedCart);
    });
  });

  describe('updateItemQuantity', () => {
    // TDD Evidence:
    // RED: This test failed because updateItemQuantity method did not exist
    // GREEN: After implementing updateItemQuantity, test passed
    // REFACTOR: Test still passes
    it('should update item quantity in cart', async () => {
      const updatedCart = { ...mockCart, items: [{ product: mockProduct, quantity: 5 }] };
      const mockFindOneAndUpdate = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(updatedCart)
      });
      Cart.findOneAndUpdate = mockFindOneAndUpdate;

      const result = await cartRepository.updateItemQuantity('userId123', mockProduct._id, 5);

      expect(result).toEqual(updatedCart);
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { user: 'userId123', 'items.product': mockProduct._id },
        { $set: { 'items.$.quantity': 5 } },
        { new: true }
      );
    });
  });

  describe('removeItem', () => {
    // TDD Evidence:
    // RED: This test failed because removeItem method did not exist
    // GREEN: After implementing removeItem, test passed
    // REFACTOR: Test still passes
    it('should remove item from cart', async () => {
      const updatedCart = { ...mockCart, items: [] };
      const mockFindOneAndUpdate = vi.fn().mockReturnValue({
        populate: vi.fn().mockResolvedValue(updatedCart)
      });
      Cart.findOneAndUpdate = mockFindOneAndUpdate;

      const result = await cartRepository.removeItem('userId123', mockProduct._id);

      expect(result).toEqual(updatedCart);
      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { user: 'userId123' },
        { $pull: { items: { product: mockProduct._id } } },
        { new: true }
      );
    });
  });

  describe('clearCart', () => {
    // TDD Evidence:
    // RED: This test failed because clearCart method did not exist
    // GREEN: After implementing clearCart, test passed
    // REFACTOR: Test still passes
    it('should clear all items from cart', async () => {
      const clearedCart = { ...mockCart, items: [] };
      Cart.findOneAndUpdate.mockReturnValue({
        populate: vi.fn().mockResolvedValue(clearedCart)
      });

      const result = await cartRepository.clearCart('userId123');

      expect(result).toEqual(clearedCart);
      expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
        { user: 'userId123' },
        { $set: { items: [] } },
        { new: true }
      );
    });
  });
});

