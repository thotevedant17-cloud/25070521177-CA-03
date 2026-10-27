import { Router } from 'express';
import {
  getProducts, getFeaturedProducts, getBestsellers,
  getNewArrivals, getTrending, searchProducts,
  getProductBySlug, getProductReviews, createReview
} from '../controllers/productController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate, reviewSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/bestsellers', getBestsellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/trending', getTrending);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticate, validate(reviewSchema), createReview);

export default router;
