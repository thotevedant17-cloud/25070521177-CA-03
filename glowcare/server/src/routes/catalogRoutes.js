import { Router } from 'express';
import { getCategories, getCategoryBySlug, getBrands, getBrandBySlug, subscribeNewsletter } from '../controllers/catalogController.js';
import { validate, newsletterSchema } from '../validators/schemas.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/brands', getBrands);
router.get('/brands/:slug', getBrandBySlug);
router.post('/newsletter/subscribe', validate(newsletterSchema), subscribeNewsletter);

export default router;
