import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { paymentAPI, paypalAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiAlertCircle } from 'react-icons/fi';

const PayPalButton = ({ orderId, amount, onPaymentSuccess, onPaymentError }) => {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const createOrder = async (data, actions) => {
    try {
      // Create PayPal order on backend
      const response = await paypalAPI.createOrder({
        orderId,
        amount
      });
      
      if (response.data.success) {
        return response.data.data.paypalOrderId;
      } else {
        throw new Error(response.data.message || 'Failed to create PayPal order');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create PayPal order';
      toast.error(errorMessage);
      throw error;
    }
  };

  const onApprove = async (data, actions) => {
    try {
      // Capture payment on backend
      const response = await paypalAPI.captureOrder({
        orderId,
        paypalOrderId: data.orderID
      });
      
      if (response.data.success) {
        toast.success('Payment successful!');
        
        // Wait to ensure database update is committed
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (onPaymentSuccess) {
          onPaymentSuccess(response.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Payment capture failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Payment failed';
      toast.error(errorMessage);
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  const onError = (err) => {
    console.error('PayPal error:', err);
    toast.error('An error occurred with PayPal. Please try again.');
    if (onPaymentError) {
      onPaymentError(err);
    }
  };

  const onCancel = (data) => {
    toast.info('Payment cancelled');
  };

  // If PayPal is not configured, show test mode
  if (!paypalClientId) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <FiAlertCircle className="text-yellow-600 mr-2 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">PayPal Test Mode</p>
            <p className="text-xs text-yellow-700 mt-1">
              PayPal is not configured. To enable PayPal payments, add VITE_PAYPAL_CLIENT_ID to your .env file.
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-blue-800 text-sm font-medium mb-2">
            Test Payment Simulation
          </p>
          <p className="text-blue-700 text-xs mb-4">
            PayPal will be simulated for testing purposes.
          </p>
          <div className="bg-white border border-blue-300 rounded p-3 mb-4">
            <p className="text-xs text-gray-600 mb-2">Test Payment Details:</p>
            <p className="text-xs text-gray-700">Order ID: {orderId}</p>
            <p className="text-xs text-gray-700">Amount: ${amount.toFixed(2)}</p>
          </div>
          <button
            type="button"
            className="w-full btn-primary"
            onClick={async () => {
              try {
                // Simulate PayPal payment in test mode
                await paypalAPI.captureOrder({
                  orderId,
                  paypalOrderId: `PAYPAL_TEST_${orderId}_${Date.now()}`
                });
                
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                if (onPaymentSuccess) {
                  onPaymentSuccess({ 
                    id: `PAYPAL_TEST_${orderId}`, 
                    status: 'COMPLETED' 
                  });
                }
              } catch (err) {
                toast.error('Test payment failed. Please try again.');
                if (onPaymentError) {
                  onPaymentError(err);
                }
              }
            }}
          >
            Complete Test Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PayPalScriptProvider 
        options={{ 
          clientId: paypalClientId,
          currency: 'USD',
          intent: 'capture'
        }}
      >
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
          }}
        />
      </PayPalScriptProvider>
      
      <div className="text-xs text-gray-500 text-center">
        <p>Your payment information is secure and encrypted</p>
        <p className="mt-1">Powered by PayPal</p>
      </div>
    </div>
  );
};

export default PayPalButton;

