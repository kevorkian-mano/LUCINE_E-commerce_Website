import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { paymentAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi';

const PaymentForm = ({ orderId, amount, clientSecret: propClientSecret, onPaymentSuccess, onPaymentError }) => {
  // Hooks must be called unconditionally
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testMode, setTestMode] = useState(false);
  
  // Use clientSecret from props if provided, otherwise it should be in Elements options
  const clientSecret = propClientSecret;

  // Extract test mode from clientSecret if it's a test payment intent
  // Real Stripe clientSecrets have format: pi_xxx_secret_xxx
  // Fake test ones have: pi_test_xxx_secret_test
  useEffect(() => {
    if (clientSecret) {
      // Check if it's a fake test clientSecret (ends with _secret_test or doesn't match Stripe format)
      const isFakeTestSecret = clientSecret.includes('_secret_test') || 
                              !clientSecret.match(/^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/);
      setTestMode(isFakeTestSecret);
    }
  }, [clientSecret]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // IMPORTANT: Call elements.submit() first before confirmPayment
      // This validates the form and prepares it for submission
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message);
        toast.error(submitError.message);
        setIsLoading(false);
        return;
      }

      // Now confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
        },
        redirect: 'if_required', // Don't redirect if payment can be confirmed immediately
      });

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
        if (onPaymentError) {
          onPaymentError(stripeError);
        }
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        toast.success('Payment successful!');
        
        // Confirm payment on backend - updates order to isPaid: true
        try {
          await paymentAPI.confirm({
            paymentIntentId: paymentIntent.id,
            orderId
          });
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (backendError) {
          toast.warning('Payment succeeded but order update may be delayed. Please refresh the page.');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Call success handler which will redirect to order details
        // The order should now have isPaid: true
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentIntent);
        }
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3D Secure or other action required
        // Stripe will handle the redirect automatically
        toast.info('Additional authentication required. Please complete the verification.');
      } else {
        // Payment in processing state
        setError('Payment is being processed. Please wait...');
        toast.info('Payment is being processed...');
      }
    } catch (err) {
      const message = err.message || 'An unexpected error occurred';
      setError(message);
      toast.error(message);
      if (onPaymentError) {
        onPaymentError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we have clientSecret - it should come from Elements options
  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Waiting for payment initialization...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {testMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <FiAlertCircle className="text-yellow-600 mr-2 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Test Mode</p>
            <p className="text-xs text-yellow-700 mt-1">
              Use test card: <strong>4242 4242 4242 4242</strong> with any future expiry date and CVC
            </p>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center mb-4">
          <FiLock className="text-green-600 mr-2" />
          <span className="text-sm text-gray-700 font-medium">
            Secure Payment
          </span>
        </div>
        {stripe && elements ? (
          <PaymentElement />
        ) : testMode ? (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-blue-800 text-sm font-medium mb-2">
              Test Mode: Payment Simulation
            </p>
            <p className="text-blue-700 text-xs mb-4">
              Stripe is not configured. Payment will be simulated for testing purposes.
            </p>
            <p className="text-blue-700 text-xs mb-4">
              To enable real Stripe payments, add a valid publishable key (pk_test_...) to your .env file.
            </p>
            <div className="bg-white border border-blue-300 rounded p-3 mb-4">
              <p className="text-xs text-gray-600 mb-2">Test Payment Details:</p>
              <p className="text-xs text-gray-700">Order ID: {orderId}</p>
              <p className="text-xs text-gray-700">Amount: ${amount.toFixed(2)}</p>
            </div>
            <button
              type="button"
              className="w-full btn-primary"
              onClick={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                try {
                  // Simulate payment success in test mode
                  // Call backend to confirm test payment
                  await paymentAPI.confirm({
                    paymentIntentId: clientSecret.split('_secret_')[0] || 'pi_test_' + orderId,
                    orderId
                  });
                  
                  if (onPaymentSuccess) {
                    onPaymentSuccess({ 
                      id: clientSecret.split('_secret_')[0] || 'pi_test_' + orderId, 
                      status: 'succeeded' 
                    });
                  }
                } catch (err) {
                  toast.error('Test payment failed. Please try again.');
                  if (onPaymentError) {
                    onPaymentError(err);
                  }
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Complete Test Payment'}
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800 text-sm font-medium mb-2">Waiting for Stripe...</p>
            <p className="text-yellow-700 text-xs mb-2">
              Stripe is loading. If this message persists, check your publishable key configuration.
            </p>
            <p className="text-yellow-700 text-xs">
              Current key: {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 
                (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...') : 
                'Not set'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <FiAlertCircle className="text-red-600 mr-2 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Payment Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={(!stripe && !testMode) || isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <FiCreditCard className="mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <p>Your payment information is secure and encrypted</p>
        <p className="mt-1">Powered by Stripe</p>
      </div>
    </form>
  );
};

export default PaymentForm;

