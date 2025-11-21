import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, cartTotal } = useCart();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link to="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.product._id} className="card flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-32 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link
                  to={`/products/${item.product._id}`}
                  className="text-lg font-semibold hover:text-primary-600 mb-2 block"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-600 text-sm mb-2">{item.product.description}</p>
                <p className="text-xl font-bold text-primary-600 mb-4">
                  ${item.product.price}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartItem(item.product._id, item.quantity - 1)}
                      className="p-1 border rounded hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.product._id, item.quantity + 1)}
                      className="p-1 border rounded hover:bg-gray-100"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{cartTotal > 100 ? 'Free' : '$10.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(cartTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    ${(cartTotal + (cartTotal > 100 ? 0 : 10) + cartTotal * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full text-center block">
              Proceed to Checkout
            </Link>
            <Link
              to="/products"
              className="btn-secondary w-full text-center block mt-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
