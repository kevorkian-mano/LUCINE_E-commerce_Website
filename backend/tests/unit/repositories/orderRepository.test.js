import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderRepository } from '../../../src/repositories/orderRepository.js';
import Order from '../../../src/models/Order.js';
import { mockOrder } from '../../helpers/mockData.js';

// Mock Order model
vi.mock('../../../src/models/Order.js', () => {
  const mockOrderConstructor = vi.fn();
  mockOrderConstructor.findById = vi.fn();
  mockOrderConstructor.find = vi.fn();
  mockOrderConstructor.findByIdAndUpdate = vi.fn();
  mockOrderConstructor.aggregate = vi.fn();
  return {
    default: mockOrderConstructor
  };
});

describe('OrderRepository', () => {
  let orderRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    orderRepository = new OrderRepository();
  });

  describe('create', () => {
    // TDD Evidence:
    // RED: This test failed because create method did not exist
    // GREEN: After implementing create, test passed
    // REFACTOR: Test still passes
    it('should create new order', async () => {
      const orderData = {
        user: 'userId123',
        orderItems: [],
        shippingAddress: {},
        paymentMethod: 'PayPal',
        totalPrice: 100
      };

      const mockSave = vi.fn().mockResolvedValue(mockOrder);
      Order.mockImplementation(() => ({
        save: mockSave
      }));

      const result = await orderRepository.create(orderData);

      expect(Order).toHaveBeenCalledWith(orderData);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    // TDD Evidence:
    // RED: This test failed because findById method did not exist
    // GREEN: After implementing findById, test passed
    // REFACTOR: Added populate for user and products, test still passes
    it('should find order by id with populated data', async () => {
      const mockFindById = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockOrder)
        })
      });
      Order.findById = mockFindById;

      const result = await orderRepository.findById(mockOrder._id);

      expect(result).toEqual(mockOrder);
      expect(mockFindById).toHaveBeenCalledWith(mockOrder._id);
    });
  });

  describe('findByUserId', () => {
    // TDD Evidence:
    // RED: This test failed because findByUserId method did not exist
    // GREEN: After implementing findByUserId, test passed
    // REFACTOR: Added sort by createdAt, test still passes
    it('should find orders by user id', async () => {
      const orders = [mockOrder];
      const mockFind = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockResolvedValue(orders)
        })
      });
      Order.find = mockFind;

      const result = await orderRepository.findByUserId('userId123');

      expect(result).toEqual(orders);
      expect(mockFind).toHaveBeenCalledWith({ user: 'userId123' });
    });
  });

  describe('findAll', () => {
    // TDD Evidence:
    // RED: This test failed because findAll method did not exist
    // GREEN: After implementing findAll, test passed
    // REFACTOR: Test still passes
    it('should return all orders with filters', async () => {
      const orders = [mockOrder];
      const filters = { status: 'pending' };
      const mockFind = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockReturnValue({
            sort: vi.fn().mockResolvedValue(orders)
          })
        })
      });
      Order.find = mockFind;

      const result = await orderRepository.findAll(filters);

      expect(result).toEqual(orders);
      expect(mockFind).toHaveBeenCalledWith(filters);
    });
  });

  describe('update', () => {
    // TDD Evidence:
    // RED: This test failed because update method did not exist
    // GREEN: After implementing update, test passed
    // REFACTOR: Test still passes
    it('should update order', async () => {
      const updateData = { status: 'shipped' };
      const updatedOrder = { ...mockOrder, ...updateData };
      Order.findByIdAndUpdate.mockResolvedValue(updatedOrder);

      const result = await orderRepository.update(mockOrder._id, updateData);

      expect(result).toEqual(updatedOrder);
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOrder._id,
        updateData,
        { new: true }
      );
    });
  });

  describe('getSalesAnalytics', () => {
    // TDD Evidence:
    // RED: This test failed because getSalesAnalytics method did not exist
    // GREEN: After implementing getSalesAnalytics with aggregation, test passed
    // REFACTOR: Test still passes
    it('should return sales analytics', async () => {
      const analytics = [{
        _id: null,
        totalSales: 1000,
        totalOrders: 10,
        averageOrderValue: 100
      }];
      Order.aggregate.mockResolvedValue(analytics);

      const result = await orderRepository.getSalesAnalytics();

      expect(result).toEqual(analytics);
      expect(Order.aggregate).toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because getSalesAnalytics didn't filter by date range
    // GREEN: After adding date filtering, test passed
    // REFACTOR: Test still passes
    it('should filter analytics by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      Order.aggregate.mockResolvedValue([]);

      await orderRepository.getSalesAnalytics(startDate, endDate);

      expect(Order.aggregate).toHaveBeenCalled();
      const matchStage = Order.aggregate.mock.calls[0][0][0].$match;
      expect(matchStage.createdAt).toBeDefined();
    });
  });

  describe('getSalesByCategory', () => {
    // TDD Evidence:
    // RED: This test failed because getSalesByCategory method did not exist
    // GREEN: After implementing getSalesByCategory with aggregation, test passed
    // REFACTOR: Test still passes
    it('should return sales by category', async () => {
      const salesByCategory = [{
        _id: 'Electronics',
        totalSales: 500,
        totalItems: 5
      }];
      Order.aggregate.mockResolvedValue(salesByCategory);

      const result = await orderRepository.getSalesByCategory();

      expect(result).toEqual(salesByCategory);
      expect(Order.aggregate).toHaveBeenCalled();
    });
  });
});

