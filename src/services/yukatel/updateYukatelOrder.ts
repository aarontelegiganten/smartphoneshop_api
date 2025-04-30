import axios from "axios";

const BASE_URL = "https://api.yukatel.de/api";

/**
 * Lock an order before updating.
 */
export const lockYukatelOrder = async (order_id: number, authcode: string, vpnr: number) => {
  const lockUrl = `${BASE_URL}/order/lock/${order_id}?authcode=${authcode}&vpnr=${vpnr}`;

  try {
    const lockResponse = await axios.get(lockUrl);
    console.log(`✅ Order ${order_id} successfully locked.`);
    
    // Ensure lock was successful
    if (lockResponse.data?.status !== true) {
      throw new Error(`Failed to lock order ${order_id}`);
    }

    return lockResponse.data;
  } catch (error: any) {
    console.error(`❌ Error locking order ${order_id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update a Yukatel order.
 */
// export const updateYukatelOrder = async (
//   order_id: number,
//   authcode: string,
//   vpnr: number,
//   newItems: { article_number: number; requested_stock: number }[],
//   customer_address_id: number,
//   customer_reference: string
// ) => {
//   try {
//     if (!order_id) throw new Error("Order ID is required");

//     const updateUrl = `${BASE_URL}/order/update/${order_id}?authcode=${authcode}&vpnr=${vpnr}`;
//     const fetchUrl = `${BASE_URL}/orders/${order_id}?authcode=${authcode}&vpnr=${vpnr}`;

//     // 1️⃣ Lock the order before updating
//     const lockResponse = await lockYukatelOrder(order_id, authcode, vpnr);
//     if (!lockResponse.status) {
//       throw new Error(`Failed to lock order ${order_id}. Cannot proceed with update.`);
//     }

//     // 2️⃣ Fetch the existing order
//     const existingOrderResponse = await axios.get(fetchUrl, { headers: { Accept: "application/json" } });
//     const existingOrder = existingOrderResponse.data;
//     console.log("📦 Existing Order:", existingOrder);

//     // 3️⃣ Filter out non-product items and create a map of existing items
//     const existingItemsMap = new Map<number, number>();

//     existingOrder.items.forEach((item: any) => {
//       const articleNumber = Number(item.artnr); // Ensure it's a number
//       if (articleNumber && !["transpversich", "49"].includes(item.artnr)) {
//         existingItemsMap.set(articleNumber, item.quantity);
//       }
//     });

//     // 4️⃣ Merge new items with existing ones
//     newItems.forEach(({ article_number, requested_stock }) => {
//       const articleNumber = Number(article_number);
//       existingItemsMap.set(articleNumber, (existingItemsMap.get(articleNumber) || 0) + requested_stock);
//     });

//     // 5️⃣ Convert the map back to an array for the payload
//     const updatedItems = Array.from(existingItemsMap.entries()).map(([article_number, requested_stock]) => ({
//       article_number,
//       requested_stock,
//     }));

//     // 6️⃣ Construct the final payload
//     const payload = {
//       items: updatedItems,
//       customer_address_id,
//       customer_reference,
//     };

//     console.log("📤 Payload:", JSON.stringify(payload, null, 2));

//     // 7️⃣ Send the update request
//     const response = await axios.put(updateUrl, payload, {
//       headers: { "Content-Type": "application/json", Accept: "application/json" },
//     });

//     console.log(`✅ Order ${order_id} updated successfully!`, response.data);
//     return response.data;
//   } catch (error: any) {
//     const errorMessage = error.response?.data?.message || error.message || "Internal Server Error";
//     console.error("❌ Error updating order:", errorMessage);
//     throw new Error(errorMessage);
//   }
// };
export const updateYukatelOrder = async (
  order_id: number,
  authcode: string,
  vpnr: number,
  newItems: { article_number: number; requested_stock: number }[],
  customer_address_id: number,
  customer_reference: string
) => {
  try {
    if (!order_id) throw new Error("Order ID is required");

    const updateUrl = `${BASE_URL}/order/update/${order_id}?authcode=${authcode}&vpnr=${vpnr}`;
    const fetchUrl = `${BASE_URL}/orders/${order_id}?authcode=${authcode}&vpnr=${vpnr}`;

    // 1️⃣ Lock the order before updating
    const lockResponse = await lockYukatelOrder(order_id, authcode, vpnr);
    if (!lockResponse.status) {
      throw new Error(`Failed to lock order ${order_id}. Cannot proceed with update.`);
    }

    // 2️⃣ Fetch the existing order
    const existingOrderResponse = await axios.get(fetchUrl, {
      headers: { Accept: "application/json" },
    });
    const existingOrder = existingOrderResponse.data;

    console.log("📦 Existing Order:", existingOrder);

    // 3️⃣ Prevent update if the order is not editable
    if (!existingOrder.editable) {
      throw new Error(`Order ${order_id} is marked as non-editable. Cannot update.`);
    }

    // 4️⃣ Filter out non-product items and map existing ones
    const excludedArticles = ["transpversich", "49", "59", "51"];
    const existingItemsMap = new Map<number, number>();

    existingOrder.items.forEach((item: any) => {
      const articleNumber = Number(item.artnr);
      if (
        articleNumber &&
        !excludedArticles.includes((item.artnr || "").toLowerCase())
      ) {
        existingItemsMap.set(articleNumber, item.quantity);
      }
    });

    // 5️⃣ Filter and merge new items
  newItems.forEach(({ article_number, requested_stock }) => {
    const artnrStr = article_number.toString().toLowerCase();
    if (!excludedArticles.includes(artnrStr)) {
      existingItemsMap.set(
        article_number,
        (existingItemsMap.get(article_number) || 0) + requested_stock
      );
    } else {
      console.log(`⛔️ Skipping excluded article_number: ${article_number}`);
    }
  });

    // 6️⃣ Convert map to array
    const updatedItems = Array.from(existingItemsMap.entries()).map(
      ([article_number, requested_stock]) => ({
        article_number,
        requested_stock,
      })
    );

    // 7️⃣ Build the final payload
    const payload = {
      items: updatedItems,
      customer_address_id,
      customer_reference,
    };

    console.log("📤 Payload:", JSON.stringify(payload, null, 2));

    // 8️⃣ Send the update request
    const response = await axios.put(updateUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log(`✅ Order ${order_id} updated successfully!`, response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Internal Server Error";
    console.error("❌ Error updating order:", errorMessage);
    throw new Error(errorMessage);
  }
};
