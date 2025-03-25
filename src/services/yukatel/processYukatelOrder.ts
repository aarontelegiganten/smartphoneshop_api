import dotenv from 'dotenv';
import { createYukatelOrder } from '@/services/yukatel/createYukatelOrder';
import { updateYukatelOrder } from '@/services/yukatel/updateYukatelOrder'; // Import the update function
import Order, { OrderLine } from '@/models/graphqlOrder';
import { YukatelError, YukatelResponse } from '@/models/YukatelOrderItem';
import { fetchYukatelOrders } from '@/services/yukatel/fetchYukatelOrders'; // Assuming this function fetches orders from Yukatel
import moment from 'moment';

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

    // Fetch current orders from Yukatel
    const orders = await fetchYukatelOrders(authcode, vpnr.toString());

    // Check if there's an order from today
    const today = moment().startOf('day');
    const latestOrder = orders?.data?.find((order) =>
      moment(order.date_placed).isSame(today, 'day')
    );

    if (latestOrder) {
      // If there's an order from today, update the order
      console.log("Order from today found. Updating the order...");
      const updatedOrderResponse: YukatelResponse = await updateYukatelOrder(
        latestOrder.order_id,
        authcode,
        vpnr,
        yukatelOrderRequest.items,
        yukatelOrderRequest.customer_address_id,
        yukatelOrderRequest.customer_reference
      );

      if (updatedOrderResponse.status) {
        console.log("✅ Order successfully updated!");
        console.log("Full Response:", JSON.stringify(updatedOrderResponse, null, 2));
      } else {
        console.error("❌ Failed to update the order:");
        updatedOrderResponse.errors?.forEach((error: YukatelError) => {
          console.error(`- Error Code: ${error.code}, Message: ${error.message}`);
        });
      }
    } else {
      // No order from today, create a new order
      console.log("No order from today. Creating a new order...");
      const response: YukatelResponse = await createYukatelOrder(authcode, vpnr, yukatelOrderRequest);

      if (response.status) {
        console.log("✅ Order successfully created!");
        console.log("Full Response:", JSON.stringify(response, null, 2));
      } else {
        console.error("❌ Order failed to create:");
        response.errors?.forEach((error: YukatelError) => {
          console.error(`- Error Code: ${error.code}, Message: ${error.message}`);
        });
      }
    }
  } catch (error) {
    // Log unexpected errors (e.g., network failure, invalid order structure)
    console.error("🚨 Error processing Yukatel order:", error);
  }
}


// import dotenv from 'dotenv';
// import { createYukatelOrder } from '@/services/yukatel/createYukatelOrder';
// import Order , { OrderLine } from '@/models/graphqlOrder';
// import { YukatelError, YukatelResponse } from '@/models/YukatelOrderItem';

// dotenv.config();
// const authcode = process.env.YUKATEL_AUTH_CODE || '';
// const vpnr = Number(process.env.YUKATEL_VPNR);


// export default async function processYukatelOrder(order: Order): Promise<void> {
//   try {
//     // Validate the order structure
//     if (!order?.data?.orderById?.orderLines || !Array.isArray(order.data.orderById.orderLines)) {
//       throw new Error("Invalid order structure: orderLines is missing or not an array.");
//     }

//     // Construct the Yukatel order request
//     const yukatelOrderRequest = {
//       items: order.data.orderById.orderLines.map((orderLine: OrderLine) => {
//         if (!orderLine.articleNumber || !orderLine.amount) {
//           throw new Error(`Invalid order line data: ${JSON.stringify(orderLine)}`);
//         }
//         return {
//           article_number: parseInt(orderLine.articleNumber, 10),
//           requested_stock: parseInt(orderLine.amount.toString(), 10),
//         };
//       }),
//       customer_address_id: 0, // Ensure this is correctly set based on actual business logic
//       customer_reference: vpnr.toString(),
//     };

//     console.log("Sending Yukatel Order Request:", JSON.stringify(yukatelOrderRequest, null, 2));

//     // Make the API call to create the order
//     const response:YukatelResponse = await createYukatelOrder(authcode, vpnr, yukatelOrderRequest);

//     // Log the full response on success
//     if (response.status) {
//       console.log("✅ Order successfully processed!");
//       console.log("Full Response:", JSON.stringify(response, null, 2)); // Log full response to inspect other details (like msg, order_id, etc.)
//     } else {
//       // Handle errors if status is false
//       console.error("❌ Order failed:");
//       if (response.errors) {
//         response.errors.forEach((error: YukatelError) => {
//           console.error(`- Error Code: ${error.code}, Message: ${error.message}, Article Number: ${error.artnr}`);
//         });
//       } else {
//         console.error(`Error Message: ${response.msg}`);
//       }
//     }
//   } catch (error) {
//     // Log unexpected errors (e.g., network failure, invalid order structure)
//     console.error("🚨 Error processing Yukatel order:", error);
//   }
// }
