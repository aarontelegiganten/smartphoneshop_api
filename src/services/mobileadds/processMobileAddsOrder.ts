import getPrestaShopAddressId from '@/services/xml/getPrestaShopAddressId';
import sendPrestashopXml from '@/services/xml/createProductXml';
import type { Prestashop, Product } from '@/models/mobileaddsShop';
import Order, { OrderLine } from '@/models/graphqlOrder';

export default async function processMobileAddsOrder(order: Order): Promise<void> {
  try {
    const products: Product[] = order.data.orderById.orderLines.map((line: OrderLine) => ({
      id: line.articleNumber,
      quantity: line.amount,
    }));

    const addressId = await getPrestaShopAddressId();
    if (!addressId) {
      console.error('Address ID is null');
      return;
    }

    const shopOrder: Prestashop = {
      address: { id: addressId },
      products,
    };

    const data = await sendPrestashopXml(shopOrder);
    console.log('Order created:', data);
  } catch (error) {
    console.error('Error processing Mobileadds order:', error);
  }
}
