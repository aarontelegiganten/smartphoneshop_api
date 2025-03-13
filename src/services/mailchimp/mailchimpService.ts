import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// --- Configuration ---
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_STORE_ID = process.env.MAILCHIMP_STORE_ID;
const MAILCHIMP_DC = process.env.MAILCHIMP_DC;

const mailchimpApi = axios.create({
  baseURL: `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/ecommerce/stores/${MAILCHIMP_STORE_ID}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
  },
});

// ✅ Delay function to prevent rate limits
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ Retry logic for handling temporary API failures
async function retryRequest(fn: () => Promise<any>, retries = 3, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) throw error; // Last attempt, throw error
      console.warn(`⚠️ Retrying request... (${i + 1}/${retries})`);
      await delay(delayMs);
    }
  }
}

// ✅ Function to Sync or Update Product in Mailchimp
export async function syncOrUpdateProductToMailchimp(productData: any): Promise<void> {
  try {
    const productId = productData.id;
    if (!productId) {
      throw new Error("❌ Product ID is required");
    }

    const productUrl = `/products/${productId}`;

    // 🔍 1️⃣ Check if the product exists in Mailchimp
    let existingProduct = null;
    try {
      const response = await retryRequest(() => mailchimpApi.get(productUrl));
      existingProduct = response.data;
    } catch (error: any) {
      if (error.response?.status !== 404) {
        throw error; // Only handle "not found" differently, rethrow other errors
      }
    }

    if (existingProduct) {
      // 🔄 2️⃣ Check if update is needed
      if (JSON.stringify(existingProduct) !== JSON.stringify(productData)) {
        await retryRequest(() => mailchimpApi.patch(productUrl, productData));
        console.log(`🔄 Updated product ${productId}`);
      } else {
        console.log(`✅ Product ${productId} is already up to date.`);
      }
    } else {
      // ➕ 3️⃣ Create new product if not found
      await retryRequest(() => mailchimpApi.post("/products", productData));
      console.log(`✅ Created new product ${productId}`);
    }

    // ⏳ 4️⃣ Add delay to prevent API rate limits
    await delay(100);
  } catch (error: any) {
    console.error(`❌ Error syncing product ${productData.id}:`, error.response?.data || error.message);
  }
}



// ✅ Delete All Products in Mailchimp
export async function deleteAllProducts(): Promise<void> {
  try {
    let totalDeleted = 0;
    let offset = 0;
    const count = 100;
    let products = [];

    do {
      const response = await mailchimpApi.get(`/products?count=${count}&offset=${offset}`);
      products = response.data.products;

      if (products.length === 0) break; // No more products

      for (const product of products) {
        await mailchimpApi.delete(`/products/${product.id}`);
        console.log(`🗑 Deleted product: ${product.id}`);
        totalDeleted++;
      }

      offset += count; // Move to next batch
    } while (products.length > 0);

    console.log(`✅ Deleted ${totalDeleted} products successfully.`);
  } catch (error: any) {
    console.error('❌ Error deleting products:', error.response?.data || error.message);
  }
}



// async function createMailchimpStore() {
//     try {
//       const response = await axios.post(
//         `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/ecommerce/stores`,
//         {
//           id: MAILCHIMP_STORE_ID,
//           list_id: 'cc4403b521',
//           name: 'Smartphoneshop.dk',
//           currency_code: 'DKK',
//           email_address: 'store@example.com',
//           domain: 'Smartphoneshop.dk'
//         },
//         {
//           auth: {
//             username: 'anystring', // Mailchimp uses Basic Auth (username can be anything)
//             password: MAILCHIMP_API_KEY,
//           },
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       console.log('✅ Store created successfully:', response.data);
//     } catch (error: any) {
//       console.error('❌ Error creating store:', error.response?.data || error.message);
//     }
//   }

//   // Call the function to create the store
//   createMailchimpStore()

// async function getMailchimpStores() {
//   try {
//     const response = await axios.get(
//       `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/ecommerce/stores`,
//       {
//         auth: {
//           username: "anystring",
//           password: MAILCHIMP_API_KEY,
//         },
//       }
//     );

//     console.log("🛒 Stores:", response.data);
//     return response.data.stores.map((store: any) => store.id);
//   } catch (error: any) {
//     console.error("❌ Error fetching stores:", error.response?.data || error.message);
//   }
// }

// getMailchimpStores();
