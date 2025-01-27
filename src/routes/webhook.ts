import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
// import WebhookRoutes from '@/routes/webhook';
// import UserRoutes from '@/routes/user';
import verifyWebhook from '@/services/verfifyWebhook';
import fetchOrder from '@/services/fetchOrder';

const router = express.Router();

dotenv.config();
const webhookToken = process.env.WEBHOOKTOKEN;

router.post('/webhook', (req: Request, res: Response, next: any) => {
  if (webhookToken == null || webhookToken.trim() === '') {
    res.status(500).send('Webhook token is missing');
  } else {
    const payload = Buffer.from(JSON.stringify(req.body));
    const secretKey = webhookToken;
    try {
      const isValid: boolean = verifyWebhook(payload, secretKey, req);
      if (isValid) {
        res.status(200).send('Webhook verified');

        const decodedPayload = payload.toString('utf-8');
        const payloadObject = JSON.parse(decodedPayload);
        console.log('Payload Object Id:', payloadObject.id);

        // Assuming the payload contains an order ID
        const orderId: string = payloadObject.id;
        fetchOrder(orderId)
          .then((order) => {
            if (order === undefined) {
              console.log('Order not found');
            } else {
              console.log('This is the order: ' + JSON.stringify(order));
            }
          })
          .catch((error) => {
            console.error('Error fetching order:', error);
          });
      } else {
        res.status(401).send('Invalid HMAC');
      }
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }
});

export default router;
