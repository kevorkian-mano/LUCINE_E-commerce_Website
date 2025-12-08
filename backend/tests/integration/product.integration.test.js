import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { setupTestApp, setupBeforeAll, cleanupAfterAll, clearCartAndOrders } from './setup.js';
import Product from '../../src/models/Product.js';
import User from '../../src/models/User.js';
import { generateToken } from '../../src/utils/jwt.js';

describe('Product Integration Tests', () => {
  let app;
  let adminToken;
  let customerToken;
  let adminId;
  let customerId;
  let testProduct1Id;
  let testProduct2Id;

  beforeAll(async () => {
    await setupBeforeAll();
    app = setupTestApp();
    
    // Create admin user - persists across tests
    const uniqueAdminEmail = `product-admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
    const admin = await User.create({
      name: 'Product Admin User',
      email: uniqueAdminEmail,
      password: 'password123',
      role: 'admin'
    });
    adminId = admin._id.toString();
    adminToken = generateToken(admin._id);

    // Create customer user - persists across tests
    const uniqueCustomerEmail = `product-customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
    const customer = await User.create({
      name: 'Product Customer User',
      email: uniqueCustomerEmail,
      password: 'password123',
      role: 'customer'
    });
    customerId = customer._id.toString();
    customerToken = generateToken(customer._id);

    // Create test products - persist across tests
    const product1 = await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 99.99,
      category: 'Electronics',
      stock: 10,
      isActive: true
    });
    testProduct1Id = product1._id.toString();

    const product2 = await Product.create({
      name: 'Product 2',
      description: 'Description 2',
      price: 149.99,
      category: 'Clothing',
      stock: 5,
      isActive: true
    });
    testProduct2Id = product2._id.toString();
    
    // Small delay to ensure all data is saved
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    await cleanupAfterAll();
    // Additional cleanup between test files
    const { cleanupBetweenTestFiles } = await import('./setup.js');
    await cleanupBetweenTestFiles();
  });

  beforeEach(async () => {
    // Product tests don't use carts or orders, so no need to clear them
    // This prevents interference with cart/order tests when running concurrently
  });

  // TDD Evidence:
  // RED: This test failed because GET products endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('GET /api/products', () => {
    // Products are created in beforeAll() - no need to recreate them

    it('should get all products without authentication', async () => {
      const response = await supertest(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should have at least 2 products (created in beforeAll)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('price');
    });

    it('should filter products by category', async () => {
      const response = await supertest(app)
        .get('/api/products/category/Electronics')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should have at least 1 Electronics product (created in beforeAll)
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].category).toBe('Electronics');
    });

    it('should search products by name', async () => {
      const response = await supertest(app)
        .get('/api/products/search?q=Product 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get product by ID', async () => {
      const product = await Product.create({
        name: 'Test Product',
        description: 'Test Description',
        price: 199.99,
        category: 'Test',
        stock: 20
      });

      const response = await supertest(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Product');
      expect(response.body.data._id).toBe(product._id.toString());
    });
  });

  // TDD Evidence:
  // RED: This test failed because POST products endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const productData = {
        name: 'New Product',
        description: 'New Description',
        price: 299.99,
        category: 'Electronics',
        stock: 15
      };

      const response = await supertest(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price);
    });

    it('should return 403 if customer tries to create product', async () => {
      const response = await supertest(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'New Product',
          description: 'New Description',
          price: 299.99,
          category: 'Electronics',
          stock: 15
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await supertest(app)
        .post('/api/products')
        .send({
          name: 'New Product',
          description: 'New Description',
          price: 299.99,
          category: 'Electronics',
          stock: 15
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Product'
          // Missing required fields (price, category, stock, etc.)
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // TDD Evidence:
  // RED: This test failed because PUT products endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Original Product',
        description: 'Original Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      });
      productId = product._id;
    });

    it('should update product as admin', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 149.99
      };

      const response = await supertest(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it('should return 403 if customer tries to update product', async () => {
      const response = await supertest(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Updated Product' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 if product does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await supertest(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Product' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // TDD Evidence:
  // RED: This test failed because DELETE products endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Product to Delete',
        description: 'Description',
        price: 99.99,
        category: 'Electronics',
        stock: 10
      });
      productId = product._id;
    });

    it('should delete product as admin', async () => {
      const response = await supertest(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify product is deleted
      const deletedProduct = await Product.findById(productId);
      expect(deletedProduct).toBeNull();
    });

    it('should return 403 if customer tries to delete product', async () => {
      const response = await supertest(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 if product does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await supertest(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

