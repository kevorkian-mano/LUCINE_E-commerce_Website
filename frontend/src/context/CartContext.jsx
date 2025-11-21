import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      setCart(res.data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await cartAPI.addItem({ productId, quantity });
      setCart(res.data.data);
      toast.success('Item added to cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const res = await cartAPI.updateItem(productId, quantity);
      setCart(res.data.data);
      toast.success('Cart updated!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await cartAPI.removeItem(productId);
      setCart(res.data.data);
      toast.success('Item removed from cart!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart(null);
      toast.success('Cart cleared!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
        cartItemCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
