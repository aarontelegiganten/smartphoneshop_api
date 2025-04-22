import dotenv from 'dotenv';
import { createYukatelOrder } from '@/services/yukatel/createYukatelOrder';
import { updateYukatelOrder } from '@/services/yukatel/updateYukatelOrder'; // Import the update function
import Order, { OrderLine } from '@/models/graphqlOrder';
import { YukatelError, YukatelResponse } from '@/models/YukatelOrderItem';
import { fetchYukatelOrders, fetchYukatelOrderById} from '@/services/yukatel/fetchYukatelOrders'; // Assuming this function fetches orders from Yukatel
import moment from "moment-timezone";

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
      customer_address_id: 0,
      customer_reference: vpnr.toString(),
    };

    const allOrders = await fetchYukatelOrders(authcode, vpnr);

    if (!allOrders || !allOrders.data || allOrders.data.length === 0) {
      console.log("📭 No previous orders found. Creating new order...");
      const createRes = await createYukatelOrder(authcode, vpnr, yukatelOrderRequest);
      return createRes.status
        ? console.log("✅ Order successfully created!")
        : console.error("❌ Failed to create order:", createRes.msg);
    }

    // Get the latest order
    const sortedOrders = allOrders.data.sort((a, b) =>
      moment(b.date_placed).diff(moment(a.date_placed))
    );
    const latest = sortedOrders[0];

    // Fetch detailed info by ID
    const latestOrderDetailed = await fetchYukatelOrderById(Number(latest.order_id), authcode, vpnr);

    if (!latestOrderDetailed) {
      throw new Error(`Could not fetch detailed order with ID ${latest.order_id}`);
    }

    if (latestOrderDetailed.editable) {
      console.log("✏️ Latest order is editable. Updating...");

      const updated = await updateYukatelOrder(
        Number(latestOrderDetailed.order_id),
        authcode,
        vpnr,
        yukatelOrderRequest.items,
        yukatelOrderRequest.customer_address_id,
        yukatelOrderRequest.customer_reference
      );

      return updated.status
        ? console.log("✅ Order successfully updated!")
        : console.error("❌ Failed to update order:", updated.msg);
    } else {
      console.log("📦 Latest order not editable. Creating new order...");
      const created = await createYukatelOrder(authcode, vpnr, yukatelOrderRequest);

      return created.status
        ? console.log("✅ Order successfully created!")
        : console.error("❌ Failed to create order:", created.msg);
    }
  } catch (error: any) {
    console.error("🚨 Error processing Yukatel order:", error.message || error);
  }
}