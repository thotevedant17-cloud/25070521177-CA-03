import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, createOrderSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/my-orders', getMyOrders);
router.get('/:orderId', getOrderById);
router.post('/:orderId/cancel', cancelOrder);

export default router;
