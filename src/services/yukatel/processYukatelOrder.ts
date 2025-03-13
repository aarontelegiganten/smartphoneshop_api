import { createOrder } from '@/services/yukatel/createYukatelOrder';

export default async function processYukatelOrder(order: any): Promise<void> {
  try {
    const yukatelOrderRequest = {
      items: order.data.orderById.orderLines.map((line: any) => ({
        article_number: line.articleNumber,
        requested_stock: line.amount,
      })),
      customer_address_id: order.data.orderById.customerId, 
      customer_reference: order.data.orderById.reference,
    };

    const authcode = process.env.YUKATEL_AUTH_CODE || '';
    const vpnr = 1234; // You might need to dynamically set this

    const response = await createOrder(authcode, vpnr, yukatelOrderRequest);
    console.log('Yukatel Order Response:', response);
  } catch (error) {
    console.error('Error processing Yukatel order:', error);
  }
}
