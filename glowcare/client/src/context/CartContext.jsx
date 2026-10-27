import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [cart, setCart] = useState({ items: [], itemCount: 0, subtotal: 0, discount: 0, shippingFee: 0, total: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/cart');
      setCart(res.data.data.cart);
    } catch {}
  }, [isAuthenticated]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.data.wishlist);
      setWishlistCount(res.data.data.count);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    try {
      setLoading(true);
      await api.post('/cart/items', { productId, quantity });
      await fetchCart();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchCart, toast]);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      await api.patch(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  }, [fetchCart, toast]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
      toast.info('Item removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    }
  }, [fetchCart, toast]);

  const clearCart = useCallback(async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], itemCount: 0, subtotal: 0, discount: 0, shippingFee: 0, total: 0 });
    } catch {}
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to save items');
      return;
    }
    try {
      await api.post(`/wishlist/${productId}`);
      await fetchWishlist();
      toast.success('Added to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to wishlist');
    }
  }, [isAuthenticated, fetchWishlist, toast]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      await fetchWishlist();
      toast.info('Removed from wishlist');
    } catch {}
  }, [fetchWishlist, toast]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.product?._id === productId);
  }, [wishlist]);

  return (
    <CartContext.Provider value={{
      cart, wishlist, wishlistCount, loading,
      addToCart, updateCartItem, removeFromCart, clearCart,
      addToWishlist, removeFromWishlist, isInWishlist,
      fetchCart, fetchWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
}
