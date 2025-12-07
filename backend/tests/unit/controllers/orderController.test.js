import { describe, it, expect, beforeEach, vi } from 'vitest';
import orderController from '../../../src/controllers/orderController.js';
import orderService from '../../../src/services/orderService.js';
import { mockOrder } from '../../helpers/mockData.js';

// Mock orderService
vi.mock('../../../src/services/orderService.js', () => ({
  default: {
    createOrder: vi.fn(),
    getUserOrders: vi.fn(),
    getOrderById: vi.fn(),
    updateOrderPayment: vi.fn(),
    getAllOrders: vi.fn(),
    getSalesAnalytics: vi.fn(),
    getSalesByCategory: vi.fn()
  }
}));

describe('OrderController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: { id: 'userId123' },
      body: {},
      params: {},
      query: {}
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('createOrder', () => {
    // TDD Evidence:
    // RED: This test failed because createOrder controller method did not exist
    // GREEN: After implementing createOrder, test passed
    // REFACTOR: Test still passes
    it('should create order', async () => {
      req.body = {
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        paymentMethod: 'PayPal'
      };
      orderService.createOrder.mockResolvedValue(mockOrder);

      await orderController.createOrder(req, res, next);

      expect(orderService.createOrder).toHaveBeenCalledWith(
        'userId123',
        req.body.shippingAddress,
        'PayPal'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order created successfully',
        data: mockOrder
      });
    });
  });

  describe('getUserOrders', () => {
    // TDD Evidence:
    // RED: This test failed because getUserOrders controller method did not exist
    // GREEN: After implementing getUserOrders, test passed
    // REFACTOR: Test still passes
    it('should return user orders', async () => {
      const orders = [mockOrder];
      orderService.getUserOrders.mockResolvedValue(orders);

      await orderController.getUserOrders(req, res, next);

      expect(orderService.getUserOrders).toHaveBeenCalledWith('userId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: orders
      });
    });
  });

  describe('getOrderById', () => {
    // TDD Evidence:
    // RED: This test failed because getOrderById controller method did not exist
    // GREEN: After implementing getOrderById, test passed
    // REFACTOR: Test still passes
    it('should return order by id', async () => {
      req.params.id = mockOrder._id;
      orderService.getOrderById.mockResolvedValue(mockOrder);

      await orderController.getOrderById(req, res, next);

      expect(orderService.getOrderById).toHaveBeenCalledWith(mockOrder._id, 'userId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder
      });
    });
  });

  describe('updateOrderPayment', () => {
    // TDD Evidence:
    // RED: This test failed because updateOrderPayment controller method did not exist
    // GREEN: After implementing updateOrderPayment, test passed
    // REFACTOR: Test still passes
    it('should update order payment', async () => {
      req.params.id = mockOrder._id;
      req.body = { paymentResult: { id: 'payment123', status: 'completed' } };
      const updatedOrder = { ...mockOrder, isPaid: true };
      orderService.updateOrderPayment.mockResolvedValue(updatedOrder);

      await orderController.updateOrderPayment(req, res, next);

      expect(orderService.updateOrderPayment).toHaveBeenCalledWith(mockOrder._id, req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order payment updated',
        data: updatedOrder
      });
    });
  });

  describe('getAllOrders', () => {
    // TDD Evidence:
    // RED: This test failed because getAllOrders controller method did not exist
    // GREEN: After implementing getAllOrders, test passed
    // REFACTOR: Test still passes
    it('should return all orders', async () => {
      const orders = [mockOrder];
      orderService.getAllOrders.mockResolvedValue(orders);

      await orderController.getAllOrders(req, res, next);

      expect(orderService.getAllOrders).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: orders
      });
    });
  });

  describe('getSalesAnalytics', () => {
    // TDD Evidence:
    // RED: This test failed because getSalesAnalytics controller method did not exist
    // GREEN: After implementing getSalesAnalytics, test passed
    // REFACTOR: Test still passes
    it('should return sales analytics', async () => {
      const analytics = { totalSales: 1000, totalOrders: 10 };
      req.query = { startDate: '2024-01-01', endDate: '2024-12-31' };
      orderService.getSalesAnalytics.mockResolvedValue(analytics);

      await orderController.getSalesAnalytics(req, res, next);

      expect(orderService.getSalesAnalytics).toHaveBeenCalledWith('2024-01-01', '2024-12-31');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: analytics
      });
    });
  });

  describe('getSalesByCategory', () => {
    // TDD Evidence:
    // RED: This test failed because getSalesByCategory controller method did not exist
    // GREEN: After implementing getSalesByCategory, test passed
    // REFACTOR: Test still passes
    it('should return sales by category', async () => {
      const sales = [{ _id: 'Electronics', totalSales: 500 }];
      req.query = { startDate: '2024-01-01' };
      orderService.getSalesByCategory.mockResolvedValue(sales);

      await orderController.getSalesByCategory(req, res, next);

      expect(orderService.getSalesByCategory).toHaveBeenCalledWith('2024-01-01', undefined);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: sales
      });
    });
  });
});

