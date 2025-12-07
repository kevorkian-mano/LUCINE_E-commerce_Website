import paymentService from '../services/paymentService.js';
import orderService from '../services/orderService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class PaymentController {
  /**
   * Create a payment intent for an order
   * POST /api/payments/create-intent
   */
  createPaymentIntent = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Verify order exists and belongs to user
    try {
      const order = await orderService.getOrderById(orderId, userId);
      
      // Verify amount matches order total (allow small floating point differences)
      const amountDifference = Math.abs(order.totalPrice - amount);
      if (amountDifference > 0.01) {
        console.warn('Amount mismatch:', {
          orderTotal: order.totalPrice,
          requestedAmount: amount,
          difference: amountDifference
        });
        return res.status(400).json({
          success: false,
          message: `Payment amount ($${amount.toFixed(2)}) does not match order total ($${order.totalPrice.toFixed(2)})`
        });
      }

      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent(
        orderId,
        amount,
        userId
      );

      res.status(200).json({
        success: true,
        data: paymentIntent
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      throw error;
    }
  });

  /**
   * Confirm a payment
   * POST /api/payments/confirm
   */
  confirmPayment = asyncHandler(async (req, res) => {
    const { paymentIntentId, paymentMethodId, orderId } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    // Verify order exists and belongs to user
    if (orderId) {
      try {
        await orderService.getOrderById(orderId, userId);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    }

    // Confirm payment
    const paymentResult = await paymentService.confirmPayment(
      paymentIntentId,
      paymentMethodId
    );

    console.log('[PaymentController] Payment result:', {
      id: paymentResult.id,
      status: paymentResult.status,
      orderId: orderId
    });

    // Update order payment status if orderId provided and payment succeeded
    if (orderId && paymentResult.status === 'succeeded') {
      console.log('[PaymentController] Updating order payment status for order:', orderId);
      try {
        const updatedOrder = await orderService.updateOrderPayment(orderId, {
          id: paymentResult.id,
          status: paymentResult.status,
          payment_method: paymentResult.payment_method,
          receipt_url: paymentResult.receipt_url,
          update_time: new Date().toISOString()
        });
        console.log('[PaymentController] Order updated successfully:', {
          orderId: updatedOrder._id,
          isPaid: updatedOrder.isPaid,
          paidAt: updatedOrder.paidAt
        });
      } catch (updateError) {
        console.error('[PaymentController] Error updating order payment:', updateError);
        // Don't fail the request, but log the error
      }
    } else {
      console.log('[PaymentController] Order not updated:', {
        orderId: orderId,
        paymentStatus: paymentResult.status,
        reason: !orderId ? 'No orderId provided' : 'Payment status is not succeeded'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: paymentResult
    });
  });

  /**
   * Get payment status
   * GET /api/payments/status/:paymentIntentId
   */
  getPaymentStatus = asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.params;

    const status = await paymentService.getPaymentStatus(paymentIntentId);

    res.status(200).json({
      success: true,
      data: status
    });
  });

  /**
   * Handle Stripe webhook
   * POST /api/payments/webhook
   * Note: For proper webhook signature verification, use raw body
   * For now, we'll accept JSON body (can be improved with express.raw() middleware)
   */
  handleWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];
    // For JSON body, convert to string for signature verification
    // In production, use raw body buffer for proper verification
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(payload, signature);

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Handle webhook event
    const result = await paymentService.handleWebhook(event);

    // Update order if payment succeeded
    if (result.processed && result.type === 'payment_succeeded' && result.orderId) {
      try {
        await orderService.updateOrderPayment(result.orderId, {
          id: result.paymentIntentId,
          status: 'succeeded',
          update_time: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating order payment:', error);
        // Don't fail webhook, log error
      }
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({
      success: true,
      message: 'Webhook processed',
      data: result
    });
  });

  /**
   * Cancel a payment intent
   * POST /api/payments/cancel
   */
  cancelPayment = asyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required'
      });
    }

    const result = await paymentService.cancelPayment(paymentIntentId);

    res.status(200).json({
      success: true,
      message: 'Payment canceled',
      data: result
    });
  });
}

export default new PaymentController();

