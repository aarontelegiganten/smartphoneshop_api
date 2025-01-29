import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
// import WebhookRoutes from '@/routes/webhook';
// import UserRoutes from '@/routes/user';
import verifyWebhook from '@/services/verfifyWebhook';
import fetchOrder from '@/services/fetchOrder';
import getPrestaShopAddressId from '@/services/getPrestaShopAddressId';
import sendPrestashopXml from '@/services/createProductXml';
import type { Prestashop, Product } from '@/models/shop';

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
              // const productId: string = JSON.parse(order.data.orderById.orderLines[0].articleNumber);
              let supplierNumber: string = order.data.orderById.orderLines[0].supplierNumber;
              // const productQuantity: string = order.data.orderById.totalItems;

              // const url: string = 'https://mobileadds.eu/module/xmlfeeds/api?id=1'; // Define the URL
              if (supplierNumber === null) {
                console.log('This is not a mobileadds product');
              } else if (supplierNumber !== null && supplierNumber === '199021') {
                supplierNumber = supplierNumber.trim();
                const products: Product[] = order.data.orderById.orderLines.map((line: any) => ({
                  id: line.articleNumber,
                  quantity: line.amount,
                }));
                getPrestaShopAddressId()
                  .then((addressId) => {
                    console.log('Address ID:', addressId);
                    if (addressId !== null) {
                      const shopOrder: Prestashop = {
                        address: { id: addressId },
                        products,
                      };
                      sendPrestashopXml(shopOrder)
                        .then((data) => {
                          console.log('Order created:', data);
                        })
                        .catch((error) => {
                          console.error('Error creating order:', error);
                        });
                    } else {
                      console.error('Address ID is null');
                    }
                  })
                  .catch((error) => {
                    console.error('Error fetching address ID:', error.data);
                  });
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
