import dotenv from 'dotenv';
import { createYukatelOrder } from '@/services/yukatel/createYukatelOrder';
import { updateYukatelOrder } from '@/services/yukatel/updateYukatelOrder'; // Import the update function
import Order, { OrderLine } from '@/models/graphqlOrder';
import { YukatelError, YukatelResponse } from '@/models/YukatelOrderItem';
import { fetchYukatelOrders } from '@/services/yukatel/fetchYukatelOrders'; // Assuming this function fetches orders from Yukatel
import moment from "moment-timezone";

dotenv.config();
const authcode = process.env.YUKATEL_AUTH_CODE || '';
const vpnr = Number(process.env.YUKATEL_VPNR);


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
//         console.log(`Article Number: ${orderLine.articleNumber}, Amount: ${orderLine.amount}`);

//         return {
//           article_number: parseInt(orderLine.articleNumber, 10),
//           requested_stock: parseInt(orderLine.amount.toString(), 10),
//         };
//       }),
//       customer_address_id: 0, // Ensure this is correctly set based on actual business logic
//       customer_reference: vpnr.toString(),
//     };

//     console.log("Sending Yukatel Order Request:", JSON.stringify(yukatelOrderRequest, null, 2));

//     // Fetch current orders from Yukatel
//     const orders = await fetchYukatelOrders(authcode, vpnr.toString());

//     // Set timezone to Berlin (same as Copenhagen)
//     const now = moment().tz("Europe/Berlin");
//     const cutoff = now.clone().hour(18).minute(0).second(0);

//     // Determine the correct starting point for order lookup
//     const orderCheckStart = now.isBefore(cutoff)
//       ? cutoff.clone().subtract(1, "day") // If before 18:00, check from yesterday at 18:00
//       : cutoff; // If after 18:00, check from today at 18:00

//     // Check if there's an order since the last cutoff time
//     const latestOrder = orders?.data?.find((order) =>
//       moment(order.date_placed).tz("Europe/Berlin").isAfter(orderCheckStart)
//     );

//     if (latestOrder) {
//       // If an order exists within the valid timeframe, update it
//       console.log("Recent order found. Updating the order...");
//       const updatedOrderResponse: YukatelResponse = await updateYukatelOrder(
//         latestOrder.order_id,
//         authcode,
//         vpnr,
//         yukatelOrderRequest.items,
//         yukatelOrderRequest.customer_address_id,
//         yukatelOrderRequest.customer_reference
//       );

//       if (updatedOrderResponse.status) {
//         console.log("✅ Order successfully updated!");
//         console.log("Full Response:", JSON.stringify(updatedOrderResponse, null, 2));
//       } else {
//         console.error("❌ Failed to update the order:");
//         updatedOrderResponse.errors?.forEach((error: YukatelError) => {
//           console.error(`- Error Code: ${error.code}, Message: ${error.message}`);
//         });
//       }
//     } else {
//       // No order found in the valid timeframe, create a new one
//       console.log("No recent order found. Creating a new order...");
//       const response: YukatelResponse = await createYukatelOrder(authcode, vpnr, yukatelOrderRequest);

//       if (response.status) {
//         console.log("✅ Order successfully created!");
//         console.log("Full Response:", JSON.stringify(response, null, 2));
//       } else {
//         console.error("❌ Order failed to create:");
//         response.errors?.forEach((error: YukatelError) => {
//           console.error(`- Error Code: ${error.code}, Message: ${error.message}`);
//         });
//       }
//     }
//   } catch (error) {
//     console.error("🚨 Error processing Yukatel order:", error);
//   }
// }


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

    console.log("Sending Yukatel Order Request:", JSON.stringify(yukatelOrderRequest, null, 2));

    // Fetch current orders from Yukatel
    const orders = await fetchYukatelOrders(authcode, vpnr.toString());

    // Set timezone to Berlin (same as Copenhagen)
    const now = moment().tz("Europe/Berlin");
    const cutoff = now.clone().hour(18).minute(0).second(0);

    let orderCheckStart: moment.Moment;

    // Check if it's between Friday 18:00 and Monday 18:00
    if (now.isoWeekday() === 5 && now.isAfter(cutoff)) {
      // Friday after 18:00 -> Start from today at 18:00
      orderCheckStart = cutoff;
    } else if (now.isoWeekday() > 5 || (now.isoWeekday() === 1 && now.isBefore(cutoff))) {
      // Saturday, Sunday, or Monday before 18:00 -> Start from last Friday at 18:00
      orderCheckStart = now.clone().weekday(5).hour(18).minute(0).second(0);
    } else {
      // Normal case: check from the previous day's 18:00
      orderCheckStart = now.isBefore(cutoff) ? cutoff.clone().subtract(1, "day") : cutoff;
    }

    console.log(`Checking for existing orders since: ${orderCheckStart.format()}`);

    const latestOrder = orders?.data?.find((order) =>
      moment(order.date_placed).tz("Europe/Berlin").isAfter(orderCheckStart)
    );

    if (latestOrder) {
      console.log("Recent order found. Updating the order...");
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
      } else {
        console.error("❌ Failed to update the order:", updatedOrderResponse.errors);
      }
    } else {
      console.log("No recent order found. Creating a new order...");
      const response: YukatelResponse = await createYukatelOrder(authcode, vpnr, yukatelOrderRequest);

      if (response.status) {
        console.log("✅ Order successfully created!");
      } else {
        console.error("❌ Order failed to create:", response.errors);
      }
    }
  } catch (error) {
    console.error("🚨 Error processing Yukatel order:", error);
  }
}