import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../utils/api';
import { FiPackage, FiCalendar } from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getUserOrders();
      setOrders(res.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FiPackage className="mr-2" />
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <Link to="/products" className="btn-primary inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="card hover:shadow-lg transition-shadow block"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="font-semibold text-lg">Order #{order._id.slice(-8)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <FiCalendar className="mr-1" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.orderItems.length} item(s) • ${order.totalPrice.toFixed(2)}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className="text-primary-600 hover:text-primary-700 font-medium">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
