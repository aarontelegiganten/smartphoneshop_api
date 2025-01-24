import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import fetchOrders from './shop';
import UserRoutes from '@/routes/user';
import verifyWebhook from '../services/verfifyWebhook';

dotenv.config();
const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await fetchOrders();
    res.json('This is the order: ' + JSON.stringify(order?.data));
  } catch (error) {
    res.status(500).send('Error fetching order');
  }
});

const webhookToken = process.env.WEBHOOKTOKEN;

router.post('/webhook', (req: Request, res: Response) => {
  if (webhookToken == null || webhookToken.trim() === '') {
    res.status(500).send('Webhook token is missing');
    return;
  }
  const payload = Buffer.from(JSON.stringify(req.body));
  const secretKey = webhookToken;

  try {
    const isValid: boolean = verifyWebhook(payload, secretKey, req);

    if (isValid) {
      const decodedPayload = payload.toString('utf-8');
      console.log('Decoded Payload:', decodedPayload);
      res.status(200).send('Webhook verified');
    } else {
      res.status(401).send('Invalid HMAC');
    }
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

router.use('/users', UserRoutes);

export default router;
