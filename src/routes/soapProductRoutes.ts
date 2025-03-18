import { Router } from 'express';
import { getProductController, getProductByItemNumberController, updateProductController } from '@/controllers/productController';
import { getSchedulerStatus, runStockUpdateNow } from '@/controllers/schedulerController';
import { Request, Response } from 'express';

const router = Router();

// Define the route to get product by ID
router.post('/product', getProductController);
router.post('/yukatel/item/id', getProductByItemNumberController);
router.post('/yukatel/item/itemnumber', updateProductController);

// Add scheduler status endpoint
router.get('/scheduler/status', (req: Request, res: Response) => {
  const status = getSchedulerStatus();
  res.status(200).json(status);
});

// Add endpoint to trigger immediate stock update
router.post('/scheduler/run-now', async (req: Request, res: Response) => {
  const result = await runStockUpdateNow();
  res.status(result.success ? 200 : 500).json(result);
});

export default router;