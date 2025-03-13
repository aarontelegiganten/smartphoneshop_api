import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import verifyWebhook from '@/utils/verfifyWebhook';
import fetchOrder from '@/services/shop99794/fetchOrder';
import processYukatelOrder from '@/services/yukatel/processYukatelOrder';
import processMobileAddsOrder from '@/services/mobileadds/processMobileAddsOrder';

const router = express.Router();
dotenv.config();

const webhookToken = process.env.WEBHOOKTOKEN;

router.post('/webhook/order-created', async (req: Request, res: Response) => {
  if (!webhookToken || webhookToken.trim() === '') {
    return res.status(500).send('Webhook token is missing');
  }

  const payload = Buffer.from(JSON.stringify(req.body));
  const secretKey = webhookToken;

  try {
    const isValid: boolean = verifyWebhook(payload, secretKey, req);
    if (!isValid) {
      return res.status(401).send('Invalid HMAC');
    }

    res.status(200).send('Webhook verified');

    const payloadObject = JSON.parse(payload.toString('utf-8'));
    const orderId: string = payloadObject.id;

    try {
      const order = await fetchOrder(orderId);
      if (!order) {
        console.log('Order not found');
        return;
      }

      const supplierNumber: string | null = order.data.orderById.orderLines[0]?.supplierNumber?.trim() || null;

      if (!supplierNumber) {
        console.log('This is not a Mobileadds or Yukatel product');
        return;
      }

      if (supplierNumber === '199021') {
        // 📌 Process Mobileadds Order
        await processMobileAddsOrder(order);
      } else if (supplierNumber === 'YUKATEL_SUPPLIER_NUMBER') {
        // 📌 Process Yukatel Order
        await processYukatelOrder(order);
      } else {
        console.log(`Unknown supplier: ${supplierNumber}`);
      }
    } catch (error) {
      console.error('Error processing order:', error);
    }
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

// 📌 Product Update Webhook (Optional, Keep As Is)
router.post('/webhook/product-updated', (req: Request, res: Response) => {
  if (!webhookToken || webhookToken.trim() === '') {
    return res.status(500).send('Webhook token is missing');
  }

  const payload = Buffer.from(JSON.stringify(req.body));
  const secretKey = webhookToken;

  try {
    const isValid: boolean = verifyWebhook(payload, secretKey, req);
    if (!isValid) {
      return res.status(401).send('Invalid HMAC');
    }

    res.status(200).send('Webhook verified');
    console.log(JSON.parse(payload.toString('utf-8')));
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

export default router;
