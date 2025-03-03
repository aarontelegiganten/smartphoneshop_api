import express from 'express';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
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
        const orderId: string = payloadObject.id;
        fetchOrder(orderId)
          .then((order) => {
            if (order === undefined) {
              console.log('Order not found');
            } else {
              let supplierNumber: string = order.data.orderById.orderLines[0].supplierNumber;
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
                    // console.log('Address ID:', addressId);
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


router.post('/webhook/product-updated', (req: Request, res: Response, next: any) => {
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
        console.log(payloadObject)
  
      } else {
        res.status(401).send('Invalid HMAC');
      }
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }
});

export default router;
