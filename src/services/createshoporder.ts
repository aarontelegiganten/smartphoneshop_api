import sendPrestashopXml from './createProductXml';
import type { Prestashop } from '../models/shop';

async function createShopOrder(addressId: string, productId: string, quantity: string): Promise<void> {
  const url = 'https://webservice_key@mobileadds.eu/api/eutradingorder/?action=create_order';
  const data: Prestashop = {
    address: {
      id: addressId,
    },
    products: [{ id: productId, quantity }],
  };

  await sendPrestashopXml(url, data);
}

export default createShopOrder;
