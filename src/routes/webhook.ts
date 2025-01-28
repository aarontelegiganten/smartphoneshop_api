import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
// import WebhookRoutes from '@/routes/webhook';
// import UserRoutes from '@/routes/user';
import verifyWebhook from '@/services/verfifyWebhook';
import fetchOrder from '@/services/fetchOrder';
import fetchMobileAddsById from '../services/fetchMobileAddsById';

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
        // console.log('Payload Object Id:', payloadObject.id);

        // Assuming the payload contains an order ID
        const orderId: string = payloadObject.id;
        fetchOrder(orderId)
          .then((order) => {
            if (order === undefined) {
              console.log('Order not found');
            } else {
              // console.log('Order found:' + JSON.parse(order.data.orderById.id));
              // console.log('This is the articleNummer: ' + JSON.parse(order.data.orderById.orderLines[0].articleNumber));
              const productId: string = JSON.parse(order.data.orderById.orderLines[0].articleNumber);
              const supplierNumber: string = order.data.orderById.orderLines[0].supplierNumber.trim();
              console.log('This is the supplierNumber: ' + supplierNumber);
              const url: string = 'https://mobileadds.eu/module/xmlfeeds/api?id=1'; // Define the URL
              if (supplierNumber === null) {
                console.log('This is not a mobileadds product');
              } else if (supplierNumber !== null && supplierNumber === '199021') {
                fetchMobileAddsById(url, productId)
                  .then((product) => {
                    if (product !== null && product !== undefined) {
                      console.log('Fetched Product:', product);
                    } else {
                      console.log('Failed to fetch product');
                    }
                  })
                  .catch((error) => {
                    console.error('Error fetching product:', error);
                  });
              } else {
                console.log('Supplier number does not match');
              }
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
