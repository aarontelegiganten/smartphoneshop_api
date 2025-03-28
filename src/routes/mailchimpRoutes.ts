import express from 'express';
import { updateProductController, syncAllProductsToMailchimpController } from '@/controllers/mailchimpController';

const router = express.Router();

// ✅ Route: Process CSV and Sync Products
router.put('/mailchimp/products/', syncAllProductsToMailchimpController);

// ✅ Route: Update Single Product
router.patch('/mailchimp/products/:id', updateProductController);

// // ✅ Route: Delete All Products
// router.delete('/mailchimp/products', deleteProductsController);

// router.put('/mailchimp/products/csv', updateProductsFromCSVController);

export default router;
