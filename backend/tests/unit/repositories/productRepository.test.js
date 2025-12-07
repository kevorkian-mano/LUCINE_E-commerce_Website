import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductRepository } from '../../../src/repositories/productRepository.js';
import Product from '../../../src/models/Product.js';
import { mockProduct } from '../../helpers/mockData.js';

// Mock Product model
vi.mock('../../../src/models/Product.js', () => {
  const mockProductConstructor = vi.fn();
  mockProductConstructor.find = vi.fn();
  mockProductConstructor.findById = vi.fn();
  mockProductConstructor.findByIdAndUpdate = vi.fn();
  mockProductConstructor.findByIdAndDelete = vi.fn();
  mockProductConstructor.distinct = vi.fn();
  return {
    default: mockProductConstructor
  };
});

describe('ProductRepository', () => {
  let productRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    productRepository = new ProductRepository();
  });

  describe('findAll', () => {
    // TDD Evidence:
    // RED: This test failed because findAll method did not exist
    // GREEN: After implementing findAll using Product.find, test passed
    // REFACTOR: Added .lean() for performance, test still passes
    it('should return all active products', async () => {
      const products = [mockProduct];
      const mockFind = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(products)
      });
      Product.find = mockFind;

      const result = await productRepository.findAll();

      expect(result).toEqual(products);
      expect(mockFind).toHaveBeenCalledWith({ isActive: true });
    });

    // TDD Evidence:
    // RED: This test failed because findAll didn't apply filters
    // GREEN: After merging filters with isActive, test passed
    // REFACTOR: Test still passes
    it('should apply filters to query', async () => {
      const filters = { category: 'Electronics', price: { $gte: 50 } };
      const products = [mockProduct];
      const mockFind = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(products)
      });
      Product.find = mockFind;

      await productRepository.findAll(filters);

      expect(mockFind).toHaveBeenCalledWith({
        isActive: true,
        ...filters
      });
    });
  });

  describe('findById', () => {
    // TDD Evidence:
    // RED: This test failed because findById method did not exist
    // GREEN: After implementing findById using Product.findById, test passed
    // REFACTOR: Test still passes
    it('should find product by id', async () => {
      Product.findById.mockResolvedValue(mockProduct);

      const result = await productRepository.findById(mockProduct._id);

      expect(result).toEqual(mockProduct);
      expect(Product.findById).toHaveBeenCalledWith(mockProduct._id);
    });
  });

  describe('search', () => {
    // TDD Evidence:
    // RED: This test failed because search method did not exist
    // GREEN: After implementing search with query building, test passed
    // REFACTOR: Improved query building logic, test still passes
    it('should search products by text', async () => {
      const products = [mockProduct];
      const mockFind = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(products)
      });
      Product.find = mockFind;

      const result = await productRepository.search('laptop');

      expect(result).toEqual(products);
      expect(mockFind).toHaveBeenCalledWith({
        isActive: true,
        $text: { $search: 'laptop' }
      });
    });

    // TDD Evidence:
    // RED: This test failed because search didn't combine multiple filters
    // GREEN: After building query with all filters, test passed
    // REFACTOR: Improved query building, test still passes
    it('should combine search term, category, and price filters', async () => {
      const products = [mockProduct];
      const mockFind = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(products)
      });
      Product.find = mockFind;

      await productRepository.search('laptop', 'Electronics', 50, 200);

      expect(mockFind).toHaveBeenCalledWith({
        isActive: true,
        $text: { $search: 'laptop' },
        category: 'Electronics',
        price: { $gte: 50, $lte: 200 }
      });
    });

    // TDD Evidence:
    // RED: This test failed because search didn't handle minPrice only
    // GREEN: After handling partial price filters, test passed
    // REFACTOR: Test still passes
    it('should handle minPrice without maxPrice', async () => {
      const mockFind = vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([])
      });
      Product.find = mockFind;

      await productRepository.search('laptop', undefined, 50, undefined);

      expect(mockFind).toHaveBeenCalledWith({
        isActive: true,
        $text: { $search: 'laptop' },
        price: { $gte: 50 }
      });
    });
  });

  describe('create', () => {
    // TDD Evidence:
    // RED: This test failed because create method did not exist
    // GREEN: After implementing create using new Product().save(), test passed
    // REFACTOR: Test still passes
    it('should create new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      const mockSave = vi.fn().mockResolvedValue({ _id: 'new-id', ...productData });
      Product.mockImplementation(() => ({
        save: mockSave
      }));

      const result = await productRepository.create(productData);

      expect(Product).toHaveBeenCalledWith(productData);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    // TDD Evidence:
    // RED: This test failed because update method did not exist
    // GREEN: After implementing update using findByIdAndUpdate, test passed
    // REFACTOR: Added { new: true } option, test still passes
    it('should update product and return updated product', async () => {
      const updateData = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, ...updateData };

      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      const result = await productRepository.update(mockProduct._id, updateData);

      expect(result).toEqual(updatedProduct);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProduct._id,
        updateData,
        { new: true }
      );
    });
  });

  describe('delete', () => {
    // TDD Evidence:
    // RED: This test failed because delete method did not exist
    // GREEN: After implementing delete using findByIdAndDelete, test passed
    // REFACTOR: Test still passes
    it('should delete product', async () => {
      Product.findByIdAndDelete.mockResolvedValue(mockProduct);

      const result = await productRepository.delete(mockProduct._id);

      expect(result).toEqual(mockProduct);
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(mockProduct._id);
    });
  });

  describe('updateStock', () => {
    // TDD Evidence:
    // RED: This test failed because updateStock method did not exist
    // GREEN: After implementing updateStock with $inc operator, test passed
    // REFACTOR: Added { new: true } option, test still passes
    it('should decrease stock by quantity', async () => {
      const quantity = 5;
      const updatedProduct = { ...mockProduct, stock: mockProduct.stock - quantity };

      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      const result = await productRepository.updateStock(mockProduct._id, quantity);

      expect(result).toEqual(updatedProduct);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProduct._id,
        { $inc: { stock: -quantity } },
        { new: true }
      );
    });
  });

  describe('getCategories', () => {
    // TDD Evidence:
    // RED: This test failed because getCategories method did not exist
    // GREEN: After implementing getCategories using Product.distinct, test passed
    // REFACTOR: Test still passes
    it('should return all distinct categories', async () => {
      const categories = ['Electronics', 'Clothing', 'Books'];
      Product.distinct.mockResolvedValue(categories);

      const result = await productRepository.getCategories();

      expect(result).toEqual(categories);
      expect(Product.distinct).toHaveBeenCalledWith('category');
    });
  });
});

