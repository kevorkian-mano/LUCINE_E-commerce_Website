import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI, paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiCreditCard, FiTruck, FiAlertCircle } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentErrorBoundary from '../components/payment/PaymentErrorBoundary';

// Initialize Stripe - only if publishable key is provided and starts with 'pk_'
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey && stripeKey.startsWith('pk_') 
  ? loadStripe(stripeKey) 
  : null;

// Log Stripe initialization status
if (stripeKey && !stripeKey.startsWith('pk_')) {
  console.warn('⚠️ Invalid Stripe publishable key. It should start with "pk_test_" or "pk_live_".');
  console.warn('Current key starts with:', stripeKey.substring(0, 3));
  console.warn('The system will run in test mode without Stripe.');
}

const Checkout = () => {
  const { cart, cartTotal, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentLoading, setPaymentIntentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'Credit Card',
  });

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode || !formData.country) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    // If credit card payment, create order first then show payment form
    if (formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card') {
      setLoading(true);
      try {
        const shippingAddress = {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        };

        const res = await orderAPI.create({
          shippingAddress,
          paymentMethod: formData.paymentMethod,
        });

        const order = res.data.data;
        setCurrentOrder(order);
        setOrderCreated(true);
        
        // For credit/debit card, create payment intent
        if (formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card') {
          setPaymentIntentLoading(true);
          
          // Small delay to ensure order is persisted
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            const paymentAmount = order.totalPrice || totalPrice;
            const paymentRes = await paymentAPI.createIntent({
              orderId: order._id,
              amount: paymentAmount
            });
            
            if (paymentRes.data.success) {
              const paymentData = paymentRes.data.data;
              setClientSecret(paymentData.clientSecret);
              setIsTestMode(paymentData.testMode || false);
              toast.success('Order created. Please complete payment.');
            } else {
              throw new Error(paymentRes.data.message || 'Failed to create payment intent');
            }
          } catch (paymentError) {
            const errorMessage = paymentError.response?.data?.message || 
                                paymentError.message || 
                                'Failed to initialize payment';
            toast.error(`Payment initialization failed: ${errorMessage}`);
            setPaymentError(errorMessage);
          } finally {
            setPaymentIntentLoading(false);
          }
        } else {
          // For credit card, show the payment form
          toast.success('Order created. Please complete payment.');
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to create order';
        toast.error(message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // For other payment methods (Bank Transfer), proceed as before
    setLoading(true);
    try {
      const shippingAddress = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      const res = await orderAPI.create({
        shippingAddress,
        paymentMethod: formData.paymentMethod,
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/orders/${res.data.data._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    toast.success('Payment successful! Order updated!');
    await clearCart();
    
    // Small delay to ensure backend update is committed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Navigate to order details - it will fetch fresh data showing isPaid: true
    navigate(`/orders/${currentOrder._id}`);
  };

  const handlePaymentError = (error) => {
    // Order is already created, user can retry payment
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const shippingPrice = cartTotal > 100 ? 0 : 10;
  const taxPrice = cartTotal * 0.1;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

  // If order is created and payment method is credit card, show payment form
  if (orderCreated && currentOrder && (formData.paymentMethod === 'Credit Card' || formData.paymentMethod === 'Debit Card')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FiCreditCard className="mr-2" />
                Payment Information
              </h2>
              <PaymentErrorBoundary>
                {clientSecret ? (
                  // Check if we have a real Stripe clientSecret (valid format) and Stripe is configured
                  (stripePromise && clientSecret.match(/^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/)) ? (
                    // Real Stripe clientSecret - use Elements
                    <Elements 
                      stripe={stripePromise}
                      options={{
                        clientSecret: clientSecret,
                        appearance: {
                          theme: 'stripe',
                        },
                      }}
                    >
                      <PaymentForm
                        orderId={currentOrder._id}
                        amount={totalPrice}
                        clientSecret={clientSecret}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    </Elements>
                  ) : (
                    // Fake test clientSecret or no Stripe - render test mode UI directly
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                        <FiAlertCircle className="text-yellow-600 mr-2 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-yellow-800">Test Mode</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Stripe is not configured. To see the payment form, add your Stripe publishable key.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-blue-800 text-sm font-medium mb-2">
                          Test Payment Simulation
                        </p>
                        <div className="bg-white border border-blue-300 rounded p-3 mb-4">
                          <p className="text-xs text-gray-600 mb-2">Payment Details:</p>
                          <p className="text-xs text-gray-700">Order ID: {currentOrder._id}</p>
                          <p className="text-xs text-gray-700">Amount: ${totalPrice.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          className="w-full btn-primary"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await paymentAPI.confirm({
                                paymentIntentId: clientSecret.split('_secret_')[0] || 'pi_test_' + currentOrder._id,
                                orderId: currentOrder._id
                              });
                              await new Promise(resolve => setTimeout(resolve, 1500));
                              handlePaymentSuccess({ 
                                id: clientSecret.split('_secret_')[0] || 'pi_test_' + currentOrder._id, 
                                status: 'succeeded' 
                              });
                            } catch (err) {
                              toast.error('Test payment failed. Please try again.');
                            }
                          }}
                        >
                          Complete Test Payment
                        </button>
                      </div>
                    </div>
                  )
                ) : paymentIntentLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Initializing payment...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium mb-2">Payment Initialization Required</p>
                    {paymentError && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-red-800 text-sm font-medium mb-1">Error:</p>
                        <p className="text-red-700 text-xs">{paymentError}</p>
                      </div>
                    )}
                    <p className="text-yellow-700 text-sm mb-4">
                      Payment intent could not be created. Please try again.
                    </p>
                    <div className="space-y-2 mb-4 text-xs text-gray-600">
                      <p>Order ID: {currentOrder._id}</p>
                      <p>Amount: ${totalPrice.toFixed(2)}</p>
                      <p>Order Total: ${currentOrder.totalPrice?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <button
                      onClick={async () => {
                        setPaymentIntentLoading(true);
                        setPaymentError(null);
                        try {
                          const paymentAmount = currentOrder.totalPrice || totalPrice;
                          const paymentRes = await paymentAPI.createIntent({
                            orderId: currentOrder._id,
                            amount: paymentAmount
                          });
                          
                          if (paymentRes.data.success) {
                            const paymentData = paymentRes.data.data;
                            setClientSecret(paymentData.clientSecret);
                            setIsTestMode(paymentData.testMode || false);
                            toast.success('Payment initialized successfully');
                          } else {
                            throw new Error(paymentRes.data.message || 'Failed to create payment intent');
                          }
                        } catch (error) {
                          const errorMessage = error.response?.data?.message || 
                                            error.message || 
                                            'Failed to initialize payment';
                          setPaymentError(errorMessage);
                          toast.error(`Failed: ${errorMessage}`);
                        } finally {
                          setPaymentIntentLoading(false);
                        }
                      }}
                      disabled={paymentIntentLoading}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {paymentIntentLoading ? 'Initializing...' : 'Retry Payment Initialization'}
                    </button>
                  </div>
                )}
              </PaymentErrorBoundary>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Items ({cart.items.length})</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Items:</h3>
                {cart.items.map((item) => (
                  <div key={item.product._id} className="text-sm text-gray-600">
                    {item.product.name} x {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiTruck className="mr-2" />
              Shipping Address
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  className="input-field"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    className="input-field"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    className="input-field"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="NY"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    className="input-field"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    required
                    className="input-field"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="USA"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FiCreditCard className="mr-2" />
                  Payment Method
                </h3>
                <select
                  name="paymentMethod"
                  className="input-field"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Items ({cart.items.length})</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'Free' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Items:</h3>
              {cart.items.map((item) => (
                <div key={item.product._id} className="text-sm text-gray-600">
                  {item.product.name} x {item.quantity}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
