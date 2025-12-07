import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class PayPalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.mode = process.env.PAYPAL_MODE || 'sandbox';
    this.baseURL = this.mode === 'live' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get PayPal access token
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn('PayPal credentials not found. PayPal processing will be disabled.');
      return null;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.accessToken = response.data.access_token;
      // Cache token for 55 minutes (tokens expire in 1 hour)
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('[PayPalService] Access token error:', error.response?.data || error.message);
      throw new Error('Failed to get PayPal access token');
    }
  }

  /**
   * Create a PayPal order
   * @param {string} orderId - The order ID from our system
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code (default: 'USD')
   * @returns {Promise<Object>} PayPal order with ID
   */
  async createOrder(orderId, amount, currency = 'USD') {
    // If PayPal is not configured, return test mode response
    if (!this.clientId || !this.clientSecret) {
      return {
        id: `PAYPAL_TEST_${orderId}_${Date.now()}`,
        status: 'CREATED',
        testMode: true
      };
    }

    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      const response = await axios.post(
        `${this.baseURL}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: orderId,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2)
            }
          }],
          application_context: {
            brand_name: 'E-Commerce Store',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/orders/${orderId}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout`
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        links: response.data.links,
        testMode: this.mode === 'sandbox'
      };
    } catch (error) {
      console.error('[PayPalService] Create order error:', error.response?.data || error.message);
      throw new Error(`Failed to create PayPal order: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Capture a PayPal order
   * @param {string} paypalOrderId - The PayPal order ID
   * @returns {Promise<Object>} Captured order details
   */
  async captureOrder(paypalOrderId) {
    // If PayPal is not configured, simulate test capture
    if (!this.clientId || !this.clientSecret) {
      return {
        id: paypalOrderId,
        status: 'COMPLETED',
        testMode: true,
        purchase_units: [{
          payments: {
            captures: [{
              id: `CAPTURE_TEST_${Date.now()}`,
              status: 'COMPLETED',
              amount: {
                currency_code: 'USD',
                value: '0.00'
              }
            }]
          }
        }]
      };
    }

    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      const response = await axios.post(
        `${this.baseURL}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        purchase_units: response.data.purchase_units,
        payer: response.data.payer
      };
    } catch (error) {
      console.error('[PayPalService] Capture error:', error.response?.data || error.message);
      throw new Error(`Failed to capture PayPal order: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get PayPal order details
   * @param {string} paypalOrderId - The PayPal order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(paypalOrderId) {
    if (!this.clientId || !this.clientSecret) {
      return {
        id: paypalOrderId,
        status: 'COMPLETED',
        testMode: true
      };
    }

    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('Failed to get access token');
      }

      const response = await axios.get(
        `${this.baseURL}/v2/checkout/orders/${paypalOrderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('[PayPalService] Get order error:', error.response?.data || error.message);
      throw new Error(`Failed to get PayPal order: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check if PayPal service is available
   * @returns {boolean}
   */
  isAvailable() {
    return !!(this.clientId && this.clientSecret);
  }
}

export default new PayPalService();

