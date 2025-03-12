
import { Router } from 'express';
import { getProductController } from '@/controllers/productController';

const router = Router();

// Define the route to get product by ID
router.post('/product', getProductController);

export default router;