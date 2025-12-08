import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { setupTestApp, setupBeforeAll, cleanupAfterAll, clearCartAndOrders } from './setup.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';
import Cart from '../../src/models/Cart.js';
import Order from '../../src/models/Order.js';
import { generateToken } from '../../src/utils/jwt.js';
import cartService from '../../src/services/cartService.js';

describe('Order Integration Tests', () => {
  let app;
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let product1Id;
  let product2Id;

  beforeAll(async () => {
    await setupBeforeAll();
    app = setupTestApp();
    
    // Create test users (admin and customer) - these persist across tests
    const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
    const user = await User.create({
      name: 'Order Test User',
      email: uniqueUserEmail,
      password: 'password123',
      role: 'customer'
    });
    userId = user._id.toString();
    userToken = generateToken(user._id);

    const uniqueAdminEmail = `order-admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
    const admin = await User.create({
      name: 'Order Admin User',
      email: uniqueAdminEmail,
      password: 'password123',
      role: 'admin'
    });
    adminId = admin._id.toString();
    adminToken = generateToken(admin._id);

    // Create test products - these persist across tests
    const product1 = await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 99.99,
      category: 'Electronics',
      stock: 10,
      isActive: true
    });
    product1Id = product1._id.toString();

    const product2 = await Product.create({
      name: 'Product 2',
      description: 'Description 2',
      price: 149.99,
      category: 'Clothing',
      stock: 5,
      isActive: true
    });
    product2Id = product2._id.toString();
    
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
    // Only clear Cart and Order for these specific users - preserve Users and Products
    // This prevents interference when tests run concurrently
    await clearCartAndOrders([userId, adminId]);
    
    // Re-verify users exist and regenerate tokens if needed (defensive check)
    let user = await User.findById(userId);
    let admin = await User.findById(adminId);
    
    // If users don't exist, recreate them (shouldn't happen, but defensive)
    if (!user) {
      console.warn(`User ${userId} not found, recreating...`);
      const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
      user = await User.create({
        name: 'Order Test User',
        email: uniqueUserEmail,
        password: 'password123',
        role: 'customer'
      });
      userId = user._id.toString();
      userToken = generateToken(user._id);
    }
    
    if (!admin) {
      console.warn(`Admin ${adminId} not found, recreating...`);
      const uniqueAdminEmail = `order-admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
      admin = await User.create({
        name: 'Order Admin User',
        email: uniqueAdminEmail,
        password: 'password123',
        role: 'admin'
      });
      adminId = admin._id.toString();
      adminToken = generateToken(admin._id);
    }
    
    // Verify products exist (they should from beforeAll, but check defensively)
    let product1 = await Product.findById(product1Id);
    let product2 = await Product.findById(product2Id);
    
    if (!product1) {
      product1 = await Product.create({
        name: 'Product 1',
        description: 'Description 1',
        price: 99.99,
        category: 'Electronics',
        stock: 10,
        isActive: true
      });
      product1Id = product1._id.toString();
    }
    
    if (!product2) {
      product2 = await Product.create({
        name: 'Product 2',
        description: 'Description 2',
        price: 149.99,
        category: 'Clothing',
        stock: 5,
        isActive: true
      });
      product2Id = product2._id.toString();
    }
  });

  // TDD Evidence:
  // RED: This test failed because POST order endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('POST /api/orders', () => {
    beforeEach(async () => {
      // Verify user exists and regenerate token if needed
      let user = await User.findById(userId);
      if (!user) {
        const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
        user = await User.create({
          name: 'Order Test User',
          email: uniqueUserEmail,
          password: 'password123',
          role: 'customer'
        });
        userId = user._id.toString();
        userToken = generateToken(user._id);
      } else {
        // Regenerate token to ensure it's valid
        userToken = generateToken(user._id);
      }
      
      // Verify products exist (they should from beforeAll, but check defensively)
      let product1 = await Product.findById(product1Id);
      let product2 = await Product.findById(product2Id);
      
      if (!product1) {
        product1 = await Product.create({
          name: 'Product 1',
          description: 'Description 1',
          price: 99.99,
          category: 'Electronics',
          stock: 10,
          isActive: true
        });
        product1Id = product1._id.toString();
      }
      
      if (!product2) {
        product2 = await Product.create({
          name: 'Product 2',
          description: 'Description 2',
          price: 149.99,
          category: 'Clothing',
          stock: 5,
          isActive: true
        });
        product2Id = product2._id.toString();
      }
      
      // Clear any existing cart first to avoid conflicts
      await Cart.deleteMany({ user: userId });
      // Small delay to ensure cart is fully deleted
      await new Promise(resolve => setTimeout(resolve, 50));
      // Products exist, add items to cart
      await cartService.addItem(userId, product1Id, 2);
      await cartService.addItem(userId, product2Id, 1);
      // Small delay to ensure items are persisted
      await new Promise(resolve => setTimeout(resolve, 50));
      // Verify cart has items using the service
      const cart = await cartService.getCart(userId);
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty after adding items in beforeEach');
      }
    });

    it('should create order from cart', async () => {
      // Verify cart has items before creating order
      const cartBefore = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cartBefore || !cartBefore.items || cartBefore.items.length === 0) {
        throw new Error('Cart is empty - items should have been added in beforeEach');
      }
      
      const shippingAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      };

      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddress,
          paymentMethod: 'Stripe'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderItems');
      expect(response.body.data.orderItems).toHaveLength(2);
      expect(response.body.data.shippingAddress.street).toBe(shippingAddress.street);
      expect(response.body.data.paymentMethod).toBe('Stripe');
      expect(response.body.data.isPaid).toBe(false);
    });

    it('should return 400 if cart is empty', async () => {
      // Clear cart using API
      await supertest(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'Stripe'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if shipping address is missing', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          paymentMethod: 'Stripe'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/orders - Authentication', () => {
    it('should return 401 without authentication', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .send({
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'Stripe'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // TDD Evidence:
  // RED: This test failed because GET my-orders endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('GET /api/orders/my-orders', () => {
    beforeEach(async () => {
      // Clear orders for this user first to ensure clean state
      await Order.deleteMany({ user: userId });
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify user exists and token is valid
      let user = await User.findById(userId);
      if (!user) {
        const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
        user = await User.create({
          name: 'Order Test User',
          email: uniqueUserEmail,
          password: 'password123',
          role: 'customer'
        });
        userId = user._id.toString();
        userToken = generateToken(user._id);
      } else {
        // Regenerate token to ensure it's valid
        userToken = generateToken(user._id);
      }
      
      // Create orders
      await Order.create([
        {
          user: userId,
          orderItems: [
            { product: product1Id, name: 'Product 1', price: 99.99, quantity: 1 }
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'Stripe',
          itemsPrice: 99.99,
          shippingPrice: 10,
          taxPrice: 9.999,
          totalPrice: 119.989
        },
        {
          user: userId,
          orderItems: [
            { product: product2Id, name: 'Product 2', price: 149.99, quantity: 1 }
          ],
          shippingAddress: {
            street: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            country: 'USA'
          },
          paymentMethod: 'PayPal',
          itemsPrice: 149.99,
          shippingPrice: 10,
          taxPrice: 14.999,
          totalPrice: 174.989
        }
      ]);
      // Small delay to ensure orders are saved
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should get user orders', async () => {
      // Ensure user exists and token is valid
      let user = await User.findById(userId);
      if (!user) {
        const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
        user = await User.create({
          name: 'Order Test User',
          email: uniqueUserEmail,
          password: 'password123',
          role: 'customer'
        });
        userId = user._id.toString();
        userToken = generateToken(user._id);
        // Recreate orders for this user
        await Order.create([
          {
            user: userId,
            orderItems: [
              { product: product1Id, name: 'Product 1', price: 99.99, quantity: 1 }
            ],
            shippingAddress: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            paymentMethod: 'Stripe',
            itemsPrice: 99.99,
            shippingPrice: 10,
            taxPrice: 9.999,
            totalPrice: 119.989
          },
          {
            user: userId,
            orderItems: [
              { product: product2Id, name: 'Product 2', price: 149.99, quantity: 1 }
            ],
            shippingAddress: {
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90001',
              country: 'USA'
            },
            paymentMethod: 'PayPal',
            itemsPrice: 149.99,
            shippingPrice: 10,
            taxPrice: 14.999,
            totalPrice: 174.989
          }
        ]);
        await new Promise(resolve => setTimeout(resolve, 50));
      } else {
        userToken = generateToken(user._id);
      }
      
      const response = await supertest(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array if user has no orders', async () => {
      // Create another user with unique email
      const uniqueNewUserEmail = `newuser-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
      const newUser = await User.create({
        name: 'New User',
        email: uniqueNewUserEmail,
        password: 'password123',
        role: 'customer'
      });
      const newUserToken = generateToken(newUser._id);

      const response = await supertest(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toHaveLength(0);
    });
  });

  // TDD Evidence:
  // RED: This test failed because GET order by ID endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('GET /api/orders/:id', () => {
    let orderId;

    beforeEach(async () => {
      // Verify user exists and regenerate token if needed
      let user = await User.findById(userId);
      if (!user) {
        const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
        user = await User.create({
          name: 'Order Test User',
          email: uniqueUserEmail,
          password: 'password123',
          role: 'customer'
        });
        userId = user._id.toString();
        userToken = generateToken(user._id);
      } else {
        // Regenerate token to ensure it's valid
        userToken = generateToken(user._id);
      }
      
      // Verify products exist (they should from beforeAll, but check defensively)
      let product1 = await Product.findById(product1Id);
      if (!product1) {
        product1 = await Product.create({
          name: 'Product 1',
          description: 'Description 1',
          price: 99.99,
          category: 'Electronics',
          stock: 10,
          isActive: true
        });
        product1Id = product1._id.toString();
      }
      
      // Clear any existing orders for this user first
      await Order.deleteMany({ user: userId });
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Products exist, create order
      const order = await Order.create({
        user: userId,
        orderItems: [
          { product: product1Id, name: 'Product 1', price: 99.99, quantity: 2 }
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        paymentMethod: 'Stripe',
        itemsPrice: 199.98,
        shippingPrice: 10,
        taxPrice: 19.998,
        totalPrice: 229.978
      });
      orderId = order._id.toString();
      // Small delay to ensure order is saved
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should get order by ID', async () => {
      // Verify user exists and token is valid
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found - cannot test order retrieval`);
      }
      // Regenerate token to ensure it's valid
      const validToken = generateToken(user._id);
      
      const response = await supertest(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(orderId);
      expect(response.body.data.orderItems).toHaveLength(1);
    });

    it('should return 404 if order does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await supertest(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 if user tries to access another user order', async () => {
      // Verify order exists
      let order = await Order.findById(orderId);
      if (!order) {
        // Recreate order if it doesn't exist
        let user = await User.findById(userId);
        if (!user) {
          const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
          user = await User.create({
            name: 'Order Test User',
            email: uniqueUserEmail,
            password: 'password123',
            role: 'customer'
          });
          userId = user._id.toString();
        }
        
        let product1 = product1Id ? await Product.findById(product1Id) : null;
        if (!product1) {
          product1 = await Product.create({
            name: 'Product 1',
            description: 'Description 1',
            price: 99.99,
            category: 'Electronics',
            stock: 10,
            isActive: true
          });
          product1Id = product1._id.toString();
        }
        
        order = await Order.create({
          user: userId,
          orderItems: [
            { product: product1Id, name: 'Product 1', price: 99.99, quantity: 2 }
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'Stripe',
          itemsPrice: 199.98,
          shippingPrice: 10,
          taxPrice: 19.998,
          totalPrice: 229.978
        });
        orderId = order._id.toString();
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Create another user for this test
      const uniqueOtherEmail = `other-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
      const otherUser = await User.create({
        name: 'Other User',
        email: uniqueOtherEmail,
        password: 'password123',
        role: 'customer'
      });
      const otherUserToken = generateToken(otherUser._id);

      const response = await supertest(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // TDD Evidence:
  // RED: This test failed because GET all orders endpoint did not exist
  // GREEN: After implementing endpoint, test passed
  // REFACTOR: Test still passes
  describe('GET /api/orders (Admin)', () => {
    beforeEach(async () => {
      // Verify admin user exists and regenerate token if needed
      let admin = await User.findById(adminId);
      if (!admin) {
        const uniqueAdminEmail = `admin-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
        admin = await User.create({
          name: 'Admin User',
          email: uniqueAdminEmail,
          password: 'password123',
          role: 'admin'
        });
        adminId = admin._id.toString();
        adminToken = generateToken(admin._id);
      } else {
        // Regenerate token to ensure it's valid
        adminToken = generateToken(admin._id);
      }
      
      // Verify regular user exists and regenerate token if needed
      let user = await User.findById(userId);
      if (!user) {
        const uniqueUserEmail = `order-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
        user = await User.create({
          name: 'Order Test User',
          email: uniqueUserEmail,
          password: 'password123',
          role: 'customer'
        });
        userId = user._id.toString();
        userToken = generateToken(user._id);
      } else {
        // Regenerate token to ensure it's valid
        userToken = generateToken(user._id);
      }
      
      // Verify products exist (they should from beforeAll, but check defensively)
      let product1 = product1Id ? await Product.findById(product1Id) : null;
      let product2 = product2Id ? await Product.findById(product2Id) : null;
      
      if (!product1) {
        product1 = await Product.create({
          name: 'Product 1',
          description: 'Description 1',
          price: 99.99,
          category: 'Electronics',
          stock: 10,
          isActive: true
        });
        product1Id = product1._id.toString();
      }
      
      if (!product2) {
        product2 = await Product.create({
          name: 'Product 2',
          description: 'Description 2',
          price: 149.99,
          category: 'Clothing',
          stock: 5,
          isActive: true
        });
        product2Id = product2._id.toString();
      }
      
      // Clear existing orders first to ensure clean state
      await Order.deleteMany({});
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Create orders for different users - use unique email
      const uniqueUser2Email = `user2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
      const user2 = await User.create({
        name: 'User 2',
        email: uniqueUser2Email,
        password: 'password123',
        role: 'customer'
      });

      await Order.create([
        {
          user: userId,
          orderItems: [{ product: product1Id, name: 'Product 1', price: 99.99, quantity: 1 }],
          shippingAddress: { street: '123 Main St', city: 'NY', state: 'NY', zipCode: '10001', country: 'USA' },
          paymentMethod: 'Stripe',
          itemsPrice: 99.99,
          shippingPrice: 10,
          taxPrice: 9.999,
          totalPrice: 119.989
        },
        {
          user: user2._id,
          orderItems: [{ product: product2Id, name: 'Product 2', price: 149.99, quantity: 1 }],
          shippingAddress: { street: '456 Oak Ave', city: 'LA', state: 'CA', zipCode: '90001', country: 'USA' },
          paymentMethod: 'PayPal',
          itemsPrice: 149.99,
          shippingPrice: 10,
          taxPrice: 14.999,
          totalPrice: 174.989
        }
      ]);
      // Small delay to ensure orders are persisted
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    it('should get all orders as admin', async () => {
      // Ensure admin exists and token is valid
      let admin = await User.findById(adminId);
      if (!admin) {
        const uniqueAdminEmail = `admin-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
        admin = await User.create({
          name: 'Admin User',
          email: uniqueAdminEmail,
          password: 'password123',
          role: 'admin'
        });
        adminId = admin._id.toString();
        adminToken = generateToken(admin._id);
      } else {
        // Regenerate token to ensure it's valid
        adminToken = generateToken(admin._id);
      }
      
      // Verify orders exist before making the request
      const orderCount = await Order.countDocuments({});
      if (orderCount < 2) {
        // Recreate orders if they don't exist
        const user2 = await User.findOne({ email: /^user2-/ }) || await User.create({
          name: 'User 2',
          email: `user2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
          password: 'password123',
          role: 'customer'
        });
        
        let product1 = product1Id ? await Product.findById(product1Id) : null;
        let product2 = product2Id ? await Product.findById(product2Id) : null;
        
        if (!product1) {
          product1 = await Product.create({
            name: 'Product 1',
            description: 'Description 1',
            price: 99.99,
            category: 'Electronics',
            stock: 10,
            isActive: true
          });
          product1Id = product1._id.toString();
        }
        
        if (!product2) {
          product2 = await Product.create({
            name: 'Product 2',
            description: 'Description 2',
            price: 149.99,
            category: 'Clothing',
            stock: 5,
            isActive: true
          });
          product2Id = product2._id.toString();
        }
        
        await Order.create([
          {
            user: userId,
            orderItems: [{ product: product1Id, name: 'Product 1', price: 99.99, quantity: 1 }],
            shippingAddress: { street: '123 Main St', city: 'NY', state: 'NY', zipCode: '10001', country: 'USA' },
            paymentMethod: 'Stripe',
            itemsPrice: 99.99,
            shippingPrice: 10,
            taxPrice: 9.999,
            totalPrice: 119.989
          },
          {
            user: user2._id,
            orderItems: [{ product: product2Id, name: 'Product 2', price: 149.99, quantity: 1 }],
            shippingAddress: { street: '456 Oak Ave', city: 'LA', state: 'CA', zipCode: '90001', country: 'USA' },
            paymentMethod: 'PayPal',
            itemsPrice: 149.99,
            shippingPrice: 10,
            taxPrice: 14.999,
            totalPrice: 174.989
          }
        ]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const response = await supertest(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(2);
    });

    it('should return 403 if customer tries to get all orders', async () => {
      const response = await supertest(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});

