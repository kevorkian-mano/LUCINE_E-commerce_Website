import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await productAPI.getById(id);
      setProduct(res.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock < quantity) {
      toast.error('Insufficient stock');
      return;
    }

    const result = await addToCart(product._id, quantity);
    if (result.success) {
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center text-gray-400">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary-600 mb-4">${product.price}</p>
            <p className="text-gray-600 mb-4">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="font-semibold">Category: </span>
              <span className="text-gray-600">{product.category}</span>
            </div>
            <div>
              <span className="font-semibold">Stock: </span>
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} available</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border rounded-lg hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 border rounded-lg hover:bg-gray-100"
                    disabled={quantity >= product.stock}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <FiShoppingCart />
                <span>Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
