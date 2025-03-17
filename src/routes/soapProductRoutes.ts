
import { Router } from 'express';
import { getProductController,getProductByItemNumberController, updateProductController } from '@/controllers/productController';

const router = Router();

// Define the route to get product by ID
router.post('/product', getProductController);
router.post('/yukatel/item/id', getProductByItemNumberController);
router.post('/yukatel/item/itemnumber', updateProductController);
export default router;