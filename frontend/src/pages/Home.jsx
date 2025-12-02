import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productAPI } from '../utils/api';
import { FiShoppingBag, FiSearch, FiTrendingUp } from 'react-icons/fi';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll({ limit: 8 }),
          productAPI.getCategories(),
        ]);
        setProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
        <h1 className="text-10xl md:text-4xl font-bold mb-4">INSPIRED BY MOONLIGHT🌙 , MADE FOR YOU TO SHINE🌕</h1>
   

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FiTrendingUp className="mr-2" />
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="card hover:shadow-lg transition-shadow text-center"
              >
                <FiShoppingBag className="text-3xl mx-auto mb-2 text-black" />
                <h3 className="font-semibold">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FiSearch className="mr-2" />
            Featured Products
          </h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 h-48 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-48 w-full object-cover object-center"
                    />
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center text-gray-400">
                      <FiShoppingBag className="text-4xl" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary-600">${product.price}</span>
                  {product.stock > 0 ? (
                    <span className="text-sm text-green-600">In Stock</span>
                  ) : (
                    <span className="text-sm text-red-600">Out of Stock</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
