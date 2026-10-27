import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, addToCartSchema, updateCartItemSchema } from '../validators/schemas.js';

const router = Router();

// Cart
router.get('/cart', authenticate, getCart);
router.post('/cart/items', authenticate, validate(addToCartSchema), addToCart);
router.patch('/cart/items/:itemId', authenticate, validate(updateCartItemSchema), updateCartItem);
router.delete('/cart/items/:itemId', authenticate, removeFromCart);
router.delete('/cart', authenticate, clearCart);

// Wishlist
router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist/:productId', authenticate, addToWishlist);
router.delete('/wishlist/:productId', authenticate, removeFromWishlist);

export default router;
