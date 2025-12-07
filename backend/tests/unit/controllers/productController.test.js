import { describe, it, expect, beforeEach, vi } from 'vitest';
import productController from '../../../src/controllers/productController.js';
import productService from '../../../src/services/productService.js';
import { mockProduct } from '../../helpers/mockData.js';

// Mock productService
vi.mock('../../../src/services/productService.js', () => ({
  default: {
    getAll: vi.fn(),
    search: vi.fn(),
    getByCategory: vi.fn(),
    getCategories: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

describe('ProductController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      query: {},
      params: {},
      body: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('getAllProducts', () => {
    // TDD Evidence:
    // RED: This test failed because getAllProducts controller method did not exist
    // GREEN: After implementing getAllProducts, test passed
    // REFACTOR: Test still passes
    it('should return all products', async () => {
      const products = [mockProduct];
      productService.getAll.mockResolvedValue(products);

      await productController.getAllProducts(req, res, next);

      expect(productService.getAll).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: products
      });
    });

    // TDD Evidence:
    // RED: This test failed because getAllProducts didn't parse query filters
    // GREEN: After parsing query parameters, test passed
    // REFACTOR: Improved filter building, test still passes
    it('should apply category filter from query', async () => {
      req.query = { category: 'Electronics' };
      productService.getAll.mockResolvedValue([mockProduct]);

      await productController.getAllProducts(req, res, next);

      expect(productService.getAll).toHaveBeenCalledWith({
        category: 'Electronics'
      });
    });

    // TDD Evidence:
    // RED: This test failed because getAllProducts didn't parse price filters
    // GREEN: After parsing minPrice and maxPrice, test passed
    // REFACTOR: Improved price filter building, test still passes
    it('should apply price range filters from query', async () => {
      req.query = { minPrice: '50', maxPrice: '200' };
      productService.getAll.mockResolvedValue([mockProduct]);

      await productController.getAllProducts(req, res, next);

      expect(productService.getAll).toHaveBeenCalledWith({
        price: { $gte: 50, $lte: 200 }
      });
    });
  });

  describe('searchProducts', () => {
    // TDD Evidence:
    // RED: This test failed because searchProducts controller method did not exist
    // GREEN: After implementing searchProducts, test passed
    // REFACTOR: Test still passes
    it('should search products with query term', async () => {
      req.query = { q: 'laptop' };
      productService.search.mockResolvedValue([mockProduct]);

      await productController.searchProducts(req, res, next);

      expect(productService.search).toHaveBeenCalledWith('laptop', undefined, undefined, undefined);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: [mockProduct]
      });
    });

    // TDD Evidence:
    // RED: This test failed because searchProducts didn't parse all query parameters
    // GREEN: After parsing all parameters, test passed
    // REFACTOR: Improved parameter parsing, test still passes
    it('should pass all search parameters to service', async () => {
      req.query = { q: 'laptop', category: 'Electronics', minPrice: '50', maxPrice: '200' };
      productService.search.mockResolvedValue([mockProduct]);

      await productController.searchProducts(req, res, next);

      expect(productService.search).toHaveBeenCalledWith('laptop', 'Electronics', 50, 200);
    });
  });

  describe('getProductById', () => {
    // TDD Evidence:
    // RED: This test failed because getProductById controller method did not exist
    // GREEN: After implementing getProductById, test passed
    // REFACTOR: Test still passes
    it('should return product by id', async () => {
      req.params.id = mockProduct._id;
      productService.getById.mockResolvedValue(mockProduct);

      await productController.getProductById(req, res, next);

      expect(productService.getById).toHaveBeenCalledWith(mockProduct._id);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct
      });
    });
  });

  describe('createProduct', () => {
    // TDD Evidence:
    // RED: This test failed because createProduct controller method did not exist
    // GREEN: After implementing createProduct, test passed
    // REFACTOR: Test still passes
    it('should create product and return 201 status', async () => {
      const productData = {
        name: 'New Product',
        description: 'Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      };

      req.body = productData;
      productService.create.mockResolvedValue({ _id: 'new-id', ...productData });

      await productController.createProduct(req, res, next);

      expect(productService.create).toHaveBeenCalledWith(productData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product created successfully',
        data: expect.objectContaining(productData)
      });
    });
  });

  describe('updateProduct', () => {
    // TDD Evidence:
    // RED: This test failed because updateProduct controller method did not exist
    // GREEN: After implementing updateProduct, test passed
    // REFACTOR: Test still passes
    it('should update product', async () => {
      req.params.id = mockProduct._id;
      req.body = { name: 'Updated Product' };
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      productService.update.mockResolvedValue(updatedProduct);

      await productController.updateProduct(req, res, next);

      expect(productService.update).toHaveBeenCalledWith(mockProduct._id, req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    });
  });

  describe('deleteProduct', () => {
    // TDD Evidence:
    // RED: This test failed because deleteProduct controller method did not exist
    // GREEN: After implementing deleteProduct, test passed
    // REFACTOR: Test still passes
    it('should delete product', async () => {
      req.params.id = mockProduct._id;
      productService.delete.mockResolvedValue(mockProduct);

      await productController.deleteProduct(req, res, next);

      expect(productService.delete).toHaveBeenCalledWith(mockProduct._id);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product deleted successfully'
      });
    });
  });
});

