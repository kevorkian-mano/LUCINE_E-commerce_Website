import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { FiCreditCard, FiTruck } from 'react-icons/fi';

const Checkout = () => {
  const { cart, cartTotal, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'PayPal',
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  const shippingPrice = cartTotal > 100 ? 0 : 10;
  const taxPrice = cartTotal * 0.1;
  const totalPrice = cartTotal + shippingPrice + taxPrice;

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
                  <option value="PayPal">PayPal</option>
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
