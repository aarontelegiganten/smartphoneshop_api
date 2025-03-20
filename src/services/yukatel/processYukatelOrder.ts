import dotenv from 'dotenv';
import { createOrder } from '@/services/yukatel/createYukatelOrder';
import Order , { OrderLine } from '@/models/graphqlOrder';
import { YukatelError, YukatelResponse } from '@/models/YukatelOrderItem';

dotenv.config();
const authcode = process.env.YUKATEL_AUTH_CODE || '';
const vpnr = Number(process.env.YUKATEL_VPNR);


export default async function processYukatelOrder(order: Order): Promise<void> {
  try {
    // Validate the order structure
    if (!order?.data?.orderById?.orderLines || !Array.isArray(order.data.orderById.orderLines)) {
      throw new Error("Invalid order structure: orderLines is missing or not an array.");
    }

    // Construct the Yukatel order request
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

    // Make the API call to create the order
    const response:YukatelResponse = await createOrder(authcode, vpnr, yukatelOrderRequest);

    // Log the full response on success
    if (response.status) {
      console.log("✅ Order successfully processed!");
      console.log("Full Response:", JSON.stringify(response, null, 2)); // Log full response to inspect other details (like msg, order_id, etc.)
    } else {
      // Handle errors if status is false
      console.error("❌ Order failed:");
      if (response.errors) {
        response.errors.forEach((error: YukatelError) => {
          console.error(`- Error Code: ${error.code}, Message: ${error.message}, Article Number: ${error.artnr}`);
        });
      } else {
        console.error(`Error Message: ${response.msg}`);
      }
    }
  } catch (error) {
    // Log unexpected errors (e.g., network failure, invalid order structure)
    console.error("🚨 Error processing Yukatel order:", error);
  }
}
