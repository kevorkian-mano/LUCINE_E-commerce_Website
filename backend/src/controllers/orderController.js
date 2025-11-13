import orderService from "../services/orderService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class OrderController {
  // Create order
  createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await orderService.createOrder(req.user.id, shippingAddress, paymentMethod);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order
    });
  });

  // Get user's orders
  getUserOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  });

  // Get order by ID
  getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user.id);
    res.json({
      success: true,
      data: order
    });
  });

  // Update order payment (admin or user)
  updateOrderPayment = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderPayment(req.params.id, req.body);
    res.json({
      success: true,
      message: "Order payment updated",
      data: order
    });
  });

  // Get all orders (admin only)
  getAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getAllOrders();
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  });

  // Get sales analytics (admin only)
  getSalesAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const analytics = await orderService.getSalesAnalytics(startDate, endDate);
    res.json({
      success: true,
      data: analytics
    });
  });

  // Get sales by category (admin only)
  getSalesByCategory = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const sales = await orderService.getSalesByCategory(startDate, endDate);
    res.json({
      success: true,
      data: sales
    });
  });
}

export default new OrderController();

