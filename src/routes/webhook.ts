import { Router } from 'express';
import { Request, Response } from 'express';
import verifyWebhook  from '@/utils/verifyWebhook';
import fetchOrder from '@/services/shop99794/fetchOrder';
import processMobileAddsOrder from '@/services/mobileadds/processMobileAddsOrder';
import processYukatelOrder from '@/services/yukatel/processYukatelOrder';
import OrderPayment from '@/models/orderPayment';
import { MailService } from '@/services/mail/mailService'; // Import MailService
const mailService = new MailService(); // Initialize mail service
// import rateLimit from 'express-rate-limit';
// import { isUpdateRunning } from '@/controllers/schedulerController';

const router = Router();

// // Rate limiter for webhook routes
// const webhookLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });

// // Queue for webhook processing
// let webhookQueue: any[] = [];
// let isProcessingQueue = false;

// async function processWebhookQueue() {
//   if (isProcessingQueue || webhookQueue.length === 0) return;
  
//   isProcessingQueue = true;
//   while (webhookQueue.length > 0) {
//     const webhook = webhookQueue.shift();
//     if (!webhook) continue;

//     try {
//       await webhook.process();
//     } catch (error) {
//       console.error('Error processing webhook from queue:', error);
//       // Optionally retry failed webhooks
//       webhookQueue.push(webhook);
//     }
//   }
//   isProcessingQueue = false;
// }

const webhookToken = process.env.WEBHOOKTOKEN;

// router.post('/webhook/order-created', webhookLimiter, async (req: Request, res: Response) => {
//   if (!webhookToken || webhookToken.trim() === '') {
//     return res.status(500).send('Webhook token is missing');
//   }

//   const payload = Buffer.from(JSON.stringify(req.body));
//   const secretKey = webhookToken;

//   try {
//     const isValid: boolean = verifyWebhook(payload, secretKey, req);
//     if (!isValid) {
//       return res.status(401).send('Invalid HMAC');
//     }

//     // Send immediate response
//     res.status(200).send('Webhook received and queued for processing');

//     // Queue the webhook processing
//     const payloadObject = JSON.parse(payload.toString('utf-8'));
//     const orderId: string = payloadObject.id;

//     webhookQueue.push({
//       process: async () => {
//         try {
//           const order = await fetchOrder(orderId);
//           if (!order) {
//             console.log('Order not found');
//             return;
//           }

//           const supplierNumber: string | null = order.data.orderById.orderLines[0]?.supplierNumber?.trim() || null;

//           if (!supplierNumber) {
//             console.log('This is not a Mobileadds or Yukatel product');
//             return;
//           }

//           if (supplierNumber === '199021') {
//             //Process Mobileadds Order
//             await processMobileAddsOrder(order);
//           } else if (supplierNumber === '505066') {
//             //Process Yukatel Order
//             await processYukatelOrder(order);
//           } else {
//             console.log(`Unknown supplier: ${supplierNumber}`);
//           }
//         } catch (error) {
//           console.error('Error processing order:', error);
//         }
//       }
//     });

//     // Start processing the queue if not already processing
//     processWebhookQueue();

//   } catch (error: any) {
//     console.error('Error in webhook processing:', error);
//     res.status(400).send(error.message);
//   }
// });


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
      console.log('Order:', JSON.stringify(order));
      
      const supplierNumber: string | null = order.data.orderById.orderLines[0]?.supplierNumber?.trim() || null;
      const payment: OrderPayment | null = order.data.orderById.payment;

      if (!supplierNumber) {
        console.log('This is not a Mobileadds or Yukatel product');
        return;
      }

      if (supplierNumber === '505066') {
        if (payment?.paymentMethod?.id === "2") {

          // 📧 Send Email Notification
          await mailService.sendMail(
            'info@smartphoneshop.dk',  // Replace with the actual recipient
            'Order Requires Manual Processing',
            `Order ID ${orderId} with supplier YUKATEL and payment method banktransfer requires manual processing.`,
            `<p>Order <b>${orderId}</b> with supplier YUKATEL requires manual handling due to payment method banktransfer.</p>`
          );

          return;
        } else {
          console.log('Processing Yukatel order...');
          await processYukatelOrder(order);
          await mailService.sendMail(
            'info@smartphoneshop.dk',  // Replace with the actual recipient
            'Order Requires Manual Processing',
            `Order ID ${orderId} with supplier YUKATEL.`,
            `<p>Order <b>${orderId}</b> with supplier YUKATEL has been send to YUKATEL.</p>`
          );
        }
      } else if (supplierNumber === '199021') {
        console.log('Processing Mobileadds order...');
        await processMobileAddsOrder(order);
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




export default router;
