import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import { FiPackage, FiTruck, FiMapPin, FiCalendar, FiRefreshCw } from 'react-icons/fi';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    // If order is not paid and was created recently (within last 2 minutes), 
    // automatically refetch after a delay to catch database updates
    if (order && !order.isPaid) {
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      const twoMinutes = 2 * 60 * 1000;
      
      if (orderAge < twoMinutes) {
        console.log('[OrderDetails] Order not paid yet, will refetch in 2 seconds...');
        const refetchTimer = setTimeout(() => {
          console.log('[OrderDetails] Refetching order to check payment status...');
          fetchOrder();
        }, 2000);
        
        return () => clearTimeout(refetchTimer);
      }
    }
  }, [order, id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getById(id);
      const fetchedOrder = res.data.data;
      setOrder(fetchedOrder);
      console.log('[OrderDetails] Order fetched:', { 
        isPaid: fetchedOrder.isPaid, 
        orderId: fetchedOrder._id,
        paidAt: fetchedOrder.paidAt 
      });
    } catch (error) {
      console.error('[OrderDetails] Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Order not found</h2>
          <Link to="/orders" className="text-primary-600 hover:text-primary-700">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/orders" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Back to Orders
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Order Details</h1>
        <div className="flex items-center space-x-4 text-gray-600">
          <span>Order #{order._id.slice(-8)}</span>
          <span>•</span>
          <div className="flex items-center">
            <FiCalendar className="mr-1" />
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiPackage className="mr-2" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-lg font-bold text-primary-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FiMapPin className="mr-2" />
              Shipping Address
            </h2>
            <div className="text-gray-600">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Items</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.isPaid ? 'Paid' : 'Pending'}
                  </span>
                  {!order.isPaid && (
                    <button
                      onClick={fetchOrder}
                      className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                      title="Refresh payment status"
                    >
                      <FiRefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Delivery Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    order.isDelivered
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.isDelivered ? 'Delivered' : 'Processing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
