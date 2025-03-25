import axios from 'axios';

const BASE_URL = 'https://api.yukatel.de/api';

export const updateYukatelOrder = async (
  order_id: number,
  authcode: string,
  vpnr: number,
  newItems: { article_number: number; requested_stock: number }[],
  customer_address_id: number,
  customer_reference: string
) => {
  try {
    if (!order_id) {
      throw new Error('Order ID is required');
    }

    const updateUrl = `${BASE_URL}/order/update/${order_id}?authcode=${authcode}&vpnr=${vpnr}`;
    const fetchUrl = `${BASE_URL}/orders/${order_id}?authcode=${authcode}&vpnr=${vpnr}`;

    // Fetch the existing order
    const existingOrderResponse = await axios.get(fetchUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const existingOrder = existingOrderResponse.data;
    const existingItems = existingOrder?.items || [];

    // Merge new items with existing ones, avoiding duplicates
    const updatedItems = [...existingItems];
    newItems.forEach((newItem) => {
      const existingItem = updatedItems.find(item => item.article_number === newItem.article_number);
      if (existingItem) {
        existingItem.requested_stock += newItem.requested_stock; // Update quantity
      } else {
        updatedItems.push(newItem);
      }
    });

    const payload = {
      items: updatedItems,
      customer_address_id,
      customer_reference,
    };

    const response = await axios.put(updateUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error updating order:', error.response?.data || error.message);
    throw new Error(error.response?.data || 'Internal Server Error');
  }
};
