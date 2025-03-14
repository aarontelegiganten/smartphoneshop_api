import dotenv from 'dotenv';
import { createOrder } from '@/services/yukatel/createYukatelOrder';
import Order , { OrderLine } from '@/models/graphqlOrder';

dotenv.config();
7
export default async function processYukatelOrder(order: Order): Promise<void> {
  try {
    const yukatelOrderRequest = {
      items: order.data.orderById.orderLines.map((orderLine: OrderLine) => ({
        article_number: Number(orderLine.articleNumber),
        requested_stock: Number(orderLine.amount),
      })),
      customer_address_id: 0, 
      customer_reference: '21904',
    };

    const authcode = process.env.YUKATEL_AUTH_CODE || '';
    const vpnr = 21904; // You might need to dynamically set this

    const response = await createOrder(authcode, vpnr, yukatelOrderRequest);
    console.log('Yukatel Order Response:', response);
  } catch (error) {
    console.error('Error processing Yukatel order:', error);
  }
}
