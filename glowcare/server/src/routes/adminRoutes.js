import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboard,
  getAdminProducts, createProduct, updateProduct, deleteProduct,
  getAdminOrders, updateOrderStatus,
  getAdminUsers,
  createCategory, updateCategory, deleteCategory,
  createBrand, updateBrand,
  getInventory,
  getAdminReviews, moderateReview,
  getAdminCoupons, createCoupon,
  getNewsletterSubscribers
} from '../controllers/adminController.js';
import { getCategories, getBrands } from '../controllers/catalogController.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);

// Products
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Users
router.get('/users', getAdminUsers);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Brands
router.get('/brands', getBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);

// Inventory
router.get('/inventory', getInventory);

// Reviews
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id', moderateReview);

// Coupons
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createCoupon);

// Newsletter
router.get('/newsletter', getNewsletterSubscribers);

export default router;
