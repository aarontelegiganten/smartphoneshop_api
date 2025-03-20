import dotenv from 'dotenv';
import { createOrder } from '@/services/yukatel/createYukatelOrder';
import Order , { OrderLine } from '@/models/graphqlOrder';

dotenv.config();
const authcode = process.env.YUKATEL_AUTH_CODE || '';
const vpnr = Number(process.env.YUKATEL_VPNR);


export default async function processYukatelOrder(order: Order): Promise<void> {
  try {
    if (!order?.data?.orderById?.orderLines || !Array.isArray(order.data.orderById.orderLines)) {
      throw new Error("Invalid order structure: orderLines is missing or not an array.");
    }

    const yukatelOrderRequest = {
      items: order.data.orderById.orderLines.map((orderLine: OrderLine) => {
        if (!orderLine.articleNumber || !orderLine.amount) {
          throw new Error(`Invalid order line data: ${JSON.stringify(orderLine)}`);
        }
        return {
          article_number: parseInt(orderLine.articleNumber, 10),
          requested_stock: parseInt(orderLine.amount.toString(), 10),
        };
      }),
      customer_address_id: 0, // Ensure this is correctly set based on actual business logic
      customer_reference: vpnr.toString(),
    };

    console.log("Sending Yukatel Order Request:", JSON.stringify(yukatelOrderRequest, null, 2));

    const response = await createOrder(authcode, vpnr, yukatelOrderRequest);

    console.log("Yukatel Order Response:", response);
  } catch (error) {
    console.error("Error processing Yukatel order:", error);
  }
}


// export default async function processYukatelOrder(order: Order): Promise<void> {
//   try {
//     const yukatelOrderRequest = {
//       items: order.data.orderById.orderLines.map((orderLine: OrderLine) => ({
//         article_number: Number(orderLine.articleNumber),
//         requested_stock: Number(orderLine.amount),
//       })),
//       customer_address_id: 0, 
//       customer_reference: vpnr.toString(),
//     };

   
//     const response = await createOrder(authcode, vpnr, yukatelOrderRequest);
//     console.log('Yukatel Order Response:', response);
//   } catch (error) {
//     console.error('Error processing Yukatel order:', error);
//   }
// }
