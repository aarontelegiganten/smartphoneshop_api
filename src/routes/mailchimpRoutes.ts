import express from 'express';
import { getOneProductController, updateProductController, syncAllProductsToMailchimpController, deleteProductsController } from '@/controllers/mailchimpController';
import { get } from 'axios';

const router = express.Router();

router.get('/mailchimp/products/:id', getOneProductController);
// ✅ Route: Get Single Product

// ✅ Route: Process CSV and Sync Products
router.put('/mailchimp/sync/products/', syncAllProductsToMailchimpController);

// ✅ Route: Update Single Product
router.patch('/mailchimp/products/:id', updateProductController);

// // ✅ Route: Delete All Products
router.delete('/mailchimp/delete/products', deleteProductsController);

// router.put('/mailchimp/products/csv', updateProductsFromCSVController);

export default router;
