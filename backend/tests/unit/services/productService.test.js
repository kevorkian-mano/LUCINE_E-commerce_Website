import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from '../../../src/services/productService.js';
import { validateProductData } from '../../../src/utils/validators.js';
import { mockProduct } from '../../helpers/mockData.js';

// Mock validators
vi.mock('../../../src/utils/validators.js', () => ({
  validateProductData: vi.fn()
}));

describe('ProductService', () => {
  let productService;
  let mockProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProductRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      search: vi.fn(),
      findByCategory: vi.fn(),
      getCategories: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateStock: vi.fn()
    };

    productService = new ProductService(mockProductRepository);
  });

  describe('getAll', () => {
    // TDD Evidence:
    // RED: This test failed because getAll method did not exist
    // GREEN: After implementing getAll, test passed
    // REFACTOR: Test still passes
    it('should return all products', async () => {
      const products = [mockProduct, { ...mockProduct, _id: '507f1f77bcf86cd799439016' }];
      mockProductRepository.findAll.mockResolvedValue(products);

      const result = await productService.getAll();

      expect(result).toEqual(products);
      expect(mockProductRepository.findAll).toHaveBeenCalledWith({});
    });

    // TDD Evidence:
    // RED: This test failed because getAll didn't pass filters to repository
    // GREEN: After passing filters parameter, test passed
    // REFACTOR: Test still passes
    it('should pass filters to repository', async () => {
      const filters = { category: 'Electronics', price: { $gte: 50 } };
      mockProductRepository.findAll.mockResolvedValue([mockProduct]);

      await productService.getAll(filters);

      expect(mockProductRepository.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('getById', () => {
    // TDD Evidence:
    // RED: This test failed because getById method did not exist
    // GREEN: After implementing getById, test passed
    // REFACTOR: Test still passes
    it('should return product by id', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getById(mockProduct._id);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(mockProduct._id);
    });

    // TDD Evidence:
    // RED: This test failed because getById didn't check if product exists
    // GREEN: After adding existence check, test passed
    // REFACTOR: Improved error message, test still passes
    it('should throw error if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.getById('nonexistent-id')).rejects.toThrow(
        'Product not found'
      );
    });

    // TDD Evidence:
    // RED: This test failed because getById didn't check if product is active
    // GREEN: After adding isActive check, test passed
    // REFACTOR: Test still passes
    it('should throw error if product is not active', async () => {
      const inactiveProduct = { ...mockProduct, isActive: false };
      mockProductRepository.findById.mockResolvedValue(inactiveProduct);

      await expect(productService.getById(mockProduct._id)).rejects.toThrow(
        'Product is not available'
      );
    });
  });

  describe('create', () => {
    // TDD Evidence:
    // RED: This test failed because create method did not exist
    // GREEN: After implementing create, test passed
    // REFACTOR: Test still passes
    it('should create product with valid data', async () => {
      const productData = {
        name: 'New Product',
        description: 'Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      validateProductData.mockReturnValue([]); // No errors
      mockProductRepository.create.mockResolvedValue({ _id: 'new-id', ...productData });

      const result = await productService.create(productData);

      expect(validateProductData).toHaveBeenCalledWith(productData);
      expect(mockProductRepository.create).toHaveBeenCalledWith(productData);
      expect(result).toHaveProperty('_id');
    });

    // TDD Evidence:
    // RED: This test failed because create didn't validate product data
    // GREEN: After adding validation, test passed
    // REFACTOR: Test still passes
    it('should throw error if validation fails', async () => {
      const invalidData = { name: '' };
      validateProductData.mockReturnValue(['Product name is required']);

      await expect(productService.create(invalidData)).rejects.toThrow(
        'Product name is required'
      );
    });
  });

  describe('update', () => {
    // TDD Evidence:
    // RED: This test failed because update method did not exist
    // GREEN: After implementing update, test passed
    // REFACTOR: Test still passes
    it('should update product', async () => {
      const updateData = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, ...updateData };

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.update(mockProduct._id, updateData);

      expect(result).toEqual(updatedProduct);
      expect(mockProductRepository.update).toHaveBeenCalledWith(mockProduct._id, updateData);
    });

    // TDD Evidence:
    // RED: This test failed because update didn't check if product exists
    // GREEN: After adding existence check, test passed
    // REFACTOR: Test still passes
    it('should throw error if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.update('nonexistent-id', {})).rejects.toThrow(
        'Product not found'
      );
    });

    // TDD Evidence:
    // RED: This test failed because update didn't validate price > 0
    // GREEN: After adding price validation, test passed
    // REFACTOR: Test still passes
    it('should throw error if price is less than or equal to 0', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      await expect(productService.update(mockProduct._id, { price: 0 })).rejects.toThrow(
        'Price must be greater than 0'
      );

      await expect(productService.update(mockProduct._id, { price: -10 })).rejects.toThrow(
        'Price must be greater than 0'
      );
    });
  });

  describe('delete', () => {
    // TDD Evidence:
    // RED: This test failed because delete method did not exist
    // GREEN: After implementing delete, test passed
    // REFACTOR: Test still passes
    it('should delete product', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue(mockProduct);

      const result = await productService.delete(mockProduct._id);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(mockProduct._id);
    });

    // TDD Evidence:
    // RED: This test failed because delete didn't check if product exists
    // GREEN: After adding existence check, test passed
    // REFACTOR: Test still passes
    it('should throw error if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.delete('nonexistent-id')).rejects.toThrow(
        'Product not found'
      );
    });
  });

  describe('updateStock', () => {
    // TDD Evidence:
    // RED: This test failed because updateStock method did not exist
    // GREEN: After implementing updateStock, test passed
    // REFACTOR: Test still passes
    it('should update stock when sufficient stock available', async () => {
      const quantity = 5;
      const updatedProduct = { ...mockProduct, stock: mockProduct.stock - quantity };

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockResolvedValue(updatedProduct);

      const result = await productService.updateStock(mockProduct._id, quantity);

      expect(result).toEqual(updatedProduct);
      expect(mockProductRepository.updateStock).toHaveBeenCalledWith(mockProduct._id, quantity);
    });

    // TDD Evidence:
    // RED: This test failed because updateStock didn't check if product exists
    // GREEN: After adding existence check, test passed
    // REFACTOR: Test still passes
    it('should throw error if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.updateStock('nonexistent-id', 5)).rejects.toThrow(
        'Product not found'
      );
    });

    // TDD Evidence:
    // RED: This test failed because updateStock didn't validate stock availability
    // GREEN: After adding stock validation, test passed
    // REFACTOR: Test still passes
    it('should throw error if insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 5 };
      mockProductRepository.findById.mockResolvedValue(lowStockProduct);

      await expect(productService.updateStock(mockProduct._id, 10)).rejects.toThrow(
        'Insufficient stock'
      );
    });
  });

  describe('search', () => {
    // TDD Evidence:
    // RED: This test failed because search method did not exist
    // GREEN: After implementing search, test passed
    // REFACTOR: Test still passes
    it('should search products with search term', async () => {
      const searchTerm = 'laptop';
      mockProductRepository.search.mockResolvedValue([mockProduct]);

      const result = await productService.search(searchTerm);

      expect(result).toEqual([mockProduct]);
      expect(mockProductRepository.search).toHaveBeenCalledWith(searchTerm, undefined, undefined, undefined);
    });

    // TDD Evidence:
    // RED: This test failed because search didn't pass all parameters
    // GREEN: After passing all search parameters, test passed
    // REFACTOR: Test still passes
    it('should pass all search parameters to repository', async () => {
      mockProductRepository.search.mockResolvedValue([mockProduct]);

      await productService.search('laptop', 'Electronics', 50, 200);

      expect(mockProductRepository.search).toHaveBeenCalledWith('laptop', 'Electronics', 50, 200);
    });
  });

  describe('getByCategory', () => {
    // TDD Evidence:
    // RED: This test failed because getByCategory method did not exist
    // GREEN: After implementing getByCategory, test passed
    // REFACTOR: Test still passes
    it('should return products by category', async () => {
      mockProductRepository.findByCategory.mockResolvedValue([mockProduct]);

      const result = await productService.getByCategory('Electronics');

      expect(result).toEqual([mockProduct]);
      expect(mockProductRepository.findByCategory).toHaveBeenCalledWith('Electronics');
    });
  });

  describe('getCategories', () => {
    // TDD Evidence:
    // RED: This test failed because getCategories method did not exist
    // GREEN: After implementing getCategories, test passed
    // REFACTOR: Test still passes
    it('should return all categories', async () => {
      const categories = ['Electronics', 'Clothing', 'Books'];
      mockProductRepository.getCategories.mockResolvedValue(categories);

      const result = await productService.getCategories();

      expect(result).toEqual(categories);
      expect(mockProductRepository.getCategories).toHaveBeenCalled();
    });
  });
});

