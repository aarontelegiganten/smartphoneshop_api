import { fetchYukatelOrders } from '@/services/yukatel/fetchYukatelOrders';
import { createYukatelOrder } from '@/services/yukatel/createYukatelOrder';
import moment from 'moment';

export const processYukatelOrders = async (authcode: string, vpnr: string) => {
  try {
    const orders = await fetchYukatelOrders(authcode, vpnr);

    if (!orders || !orders.data || orders.data.length === 0) {
      console.log('No existing orders found. Creating a new order...');
    //   const newOrder = await processYukatelOrder(authcode, vpnr, orderData);
    // return newOrder;
    }

    // Get the latest order
    const latestOrder = orders.data[0];
    const orderDate = moment(latestOrder.date_placed, 'YYYY-MM-DD HH:mm:ss');
    const today = moment().startOf('day');

    if (orderDate.isSame(today, 'day')) {
      console.log('Order is from today. Preparing for update...');
    //   const updatedOrder = await updateYukatelOrder(latestOrder.order_id, authcode, vpnr);
    //   return updatedOrder;
    }

    console.log('No orders from today. No update needed.');
    return latestOrder;
  } catch (error) {
    console.error('Error processing Yukatel orders:', error);
    throw new Error('Failed to process orders');
  }
};
