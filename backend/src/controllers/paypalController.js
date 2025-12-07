import paypalService from '../services/paypalService.js';
import orderService from '../services/orderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class PayPalController {
  /**
   * Create a PayPal order
   * POST /api/paypal/create-order
   */
  createOrder = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    // Verify order exists and belongs to user
    try {
      await orderService.getOrderById(orderId, userId);
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      throw error;
    }

    // Create PayPal order
    const paypalOrder = await paypalService.createOrder(orderId, amount);

    res.status(200).json({
      success: true,
      data: {
        paypalOrderId: paypalOrder.id,
        status: paypalOrder.status,
        testMode: paypalOrder.testMode || false
      }
    });
  });

  /**
   * Capture a PayPal order
   * POST /api/paypal/capture-order
   */
  captureOrder = asyncHandler(async (req, res) => {
    const { orderId, paypalOrderId } = req.body;
    const userId = req.user.id;

    if (!orderId || !paypalOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and PayPal Order ID are required'
      });
    }

    // Verify order exists and belongs to user
    try {
      await orderService.getOrderById(orderId, userId);
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      throw error;
    }

    // Capture PayPal payment
    const captureResult = await paypalService.captureOrder(paypalOrderId);

    // Update order payment status if capture succeeded
    if (captureResult.status === 'COMPLETED') {
      try {
        const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
        await orderService.updateOrderPayment(orderId, {
          id: capture?.id || paypalOrderId,
          status: 'COMPLETED',
          payment_method: 'PayPal',
          receipt_url: capture?.links?.find(link => link.rel === 'up')?.href || null,
          update_time: new Date().toISOString()
        });
      } catch (updateError) {
        console.error('[PayPalController] Error updating order payment:', updateError);
        // Don't fail the request, but log the error
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment captured successfully',
      data: captureResult
    });
  });

  /**
   * Get PayPal order status
   * GET /api/paypal/order/:paypalOrderId
   */
  getOrderStatus = asyncHandler(async (req, res) => {
    const { paypalOrderId } = req.params;

    if (!paypalOrderId) {
      return res.status(400).json({
        success: false,
        message: 'PayPal Order ID is required'
      });
    }

    const order = await paypalService.getOrder(paypalOrderId);

    res.status(200).json({
      success: true,
      data: order
    });
  });
}

export default new PayPalController();

