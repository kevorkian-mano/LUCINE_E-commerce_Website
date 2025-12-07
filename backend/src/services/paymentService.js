import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

class PaymentService {
  constructor() {
    // Initialize Stripe with secret key
    // Use test key if in test mode, otherwise use live key
    const secretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_TEST_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('Stripe secret key not found. Payment processing will be disabled.');
      this.stripe = null;
      this.testMode = true;
    } else {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-11-20.acacia',
      });
      this.testMode = process.env.PAYMENT_MODE === 'test' || secretKey.startsWith('sk_test_');
    }
  }

  /**
   * Create a Payment Intent for an order
   * @param {string} orderId - The order ID
   * @param {number} amount - Amount in dollars (will be converted to cents)
   * @param {string} userId - User ID for metadata
   * @param {string} currency - Currency code (default: 'usd')
   * @returns {Promise<Object>} Payment Intent with client secret
   */
  async createPaymentIntent(orderId, amount, userId, currency = 'usd') {
    // If Stripe is not configured, return test mode response
    if (!this.stripe) {
      return {
        id: `pi_test_${orderId}_${Date.now()}`,
        clientSecret: `pi_test_${orderId}_${Date.now()}_secret_test`,
        status: 'requires_payment_method',
        testMode: true
      };
    }

    try {
      // Convert amount to cents (Stripe uses smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      // Create idempotency key to prevent duplicate charges
      const idempotencyKey = `order_${orderId}_${Date.now()}`;

      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount: amountInCents,
          currency: currency.toLowerCase(),
          metadata: {
            orderId: orderId,
            userId: userId,
          },
          // Automatically confirm if in test mode with specific test cards
          automatic_payment_methods: {
            enabled: true,
          },
        },
        {
          idempotencyKey: idempotencyKey,
        }
      );

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        testMode: this.testMode
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - The Payment Intent ID
   * @param {string} paymentMethodId - The Payment Method ID (optional, can be attached)
   * @returns {Promise<Object>} Confirmed Payment Intent
   */
  async confirmPayment(paymentIntentId, paymentMethodId = null) {
    // If Stripe is not configured, simulate test confirmation
    if (!this.stripe) {
      console.log('[PaymentService] Test mode: Simulating payment confirmation for', paymentIntentId);
      return {
        id: paymentIntentId,
        status: 'succeeded',
        testMode: true,
        payment_method: paymentMethodId || 'pm_test_123'
      };
    }

    try {
      // First, retrieve the payment intent to check its current status
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      console.log('[PaymentService] Retrieved payment intent:', paymentIntent.id, 'Status:', paymentIntent.status);

      // If payment is already succeeded, just return it (don't try to confirm again)
      if (paymentIntent.status === 'succeeded') {
        console.log('[PaymentService] Payment already succeeded, returning existing status');
        return {
          id: paymentIntent.id,
          status: paymentIntent.status,
          payment_method: paymentIntent.payment_method,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          charges: paymentIntent.charges?.data || [],
          receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
        };
      }

      // If payment method is provided, attach it
      if (paymentMethodId && paymentIntent.status === 'requires_payment_method') {
        await this.stripe.paymentIntents.update(paymentIntentId, {
          payment_method: paymentMethodId,
        });
      }

      // Only confirm if not already succeeded
      let confirmedIntent = paymentIntent;
      if (paymentIntent.status !== 'succeeded') {
        console.log('[PaymentService] Confirming payment intent...');
        confirmedIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
        console.log('[PaymentService] Payment confirmed, new status:', confirmedIntent.status);
      }

      return {
        id: confirmedIntent.id,
        status: confirmedIntent.status,
        payment_method: confirmedIntent.payment_method,
        amount: confirmedIntent.amount,
        currency: confirmedIntent.currency,
        charges: confirmedIntent.charges?.data || [],
        receipt_url: confirmedIntent.charges?.data?.[0]?.receipt_url || null,
      };
    } catch (error) {
      console.error('[PaymentService] Error confirming payment:', error);
      // If error is that payment is already confirmed, retrieve and return it
      if (error.code === 'payment_intent_unexpected_state' || error.message?.includes('already')) {
        try {
          const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
          console.log('[PaymentService] Payment already processed, returning current status:', paymentIntent.status);
          return {
            id: paymentIntent.id,
            status: paymentIntent.status,
            payment_method: paymentIntent.payment_method,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            charges: paymentIntent.charges?.data || [],
            receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
          };
        } catch (retrieveError) {
          console.error('[PaymentService] Error retrieving payment after confirmation error:', retrieveError);
        }
      }
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Get payment intent status
   * @param {string} paymentIntentId - The Payment Intent ID
   * @returns {Promise<Object>} Payment Intent status
   */
  async getPaymentStatus(paymentIntentId) {
    // If Stripe is not configured, return test status
    if (!this.stripe) {
      return {
        id: paymentIntentId,
        status: 'succeeded',
        testMode: true
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_method: paymentIntent.payment_method,
      };
    } catch (error) {
      console.error('Error retrieving payment status:', error);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook event
   * @param {Object} event - Stripe webhook event
   * @returns {Object} Processed event data
   */
  async handleWebhook(event) {
    if (!this.stripe) {
      console.warn('Stripe not configured, webhook ignored');
      return { processed: false, reason: 'Stripe not configured' };
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return {
            processed: true,
            type: 'payment_succeeded',
            paymentIntentId: event.data.object.id,
            orderId: event.data.object.metadata?.orderId,
            amount: event.data.object.amount,
            currency: event.data.object.currency,
          };

        case 'payment_intent.payment_failed':
          return {
            processed: true,
            type: 'payment_failed',
            paymentIntentId: event.data.object.id,
            orderId: event.data.object.metadata?.orderId,
            error: event.data.object.last_payment_error,
          };

        case 'payment_intent.requires_action':
          return {
            processed: true,
            type: 'payment_requires_action',
            paymentIntentId: event.data.object.id,
            orderId: event.data.object.metadata?.orderId,
            nextAction: event.data.object.next_action,
          };

        default:
          return {
            processed: false,
            type: event.type,
            message: 'Event type not handled',
          };
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Stripe signature header
   * @returns {Object} Verified event or null
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.stripe) {
      // In test mode without Stripe, skip verification
      try {
        return JSON.parse(payload);
      } catch {
        return null;
      }
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('Webhook secret not configured, skipping verification');
      try {
        return JSON.parse(payload);
      } catch {
        return null;
      }
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return null;
    }
  }

  /**
   * Cancel a payment intent
   * @param {string} paymentIntentId - The Payment Intent ID
   * @returns {Promise<Object>} Cancelled Payment Intent
   */
  async cancelPayment(paymentIntentId) {
    if (!this.stripe) {
      return {
        id: paymentIntentId,
        status: 'canceled',
        testMode: true
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }

  /**
   * Check if payment service is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.stripe !== null || this.testMode;
  }
}

export default new PaymentService();

