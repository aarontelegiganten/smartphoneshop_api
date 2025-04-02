import axios from "axios";
import dotenv from "dotenv";
import { createSoapClient, setLanguage } from '@/services/soap/soapClient';
import { authenticate } from '@/services/soap/soapClient';
import { fetchAllProductsWithPagination } from "@/services/soap/getProductService";
import { MailchimpProduct } from "@/models/mailchimpProduct";
dotenv.config();

// --- Configuration ---
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_STORE_ID = process.env.MAILCHIMP_STORE_ID;
const MAILCHIMP_DC = process.env.MAILCHIMP_DC;

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const languageISO = "DK";

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

export async function findProductInMailchimp(productId: string) {
  try {
    const response = await mailchimpApi.get(`/products/${productId}`);
    return response.data; // ✅ Product found, return it
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`❌ Product ${productId} not found in Mailchimp.`);
      return null; // ❌ Product does not exist
    } else {
      console.error(`⚠️ Error finding product ${productId}:`, error.response?.data || error.message);
      throw error; // ⚠️ Rethrow other errors
    }
  }
}

// ✅ Function to Sync or Update Product in Mailchimp
export async function syncOrUpdateProductToMailchimp(productData: MailchimpProduct): Promise<void> {
  try {
    const productId = productData.id;
    if (!productId) {
      throw new Error("❌ Product ID is required");
    }

    const productUrl = `/products/${productId}`;

    // 🔍 1️⃣ Check if the product exists in Mailchimp
    let existingProduct = null;
    try {
      // Fetch the product by ID to see if it exists
      const response = await mailchimpApi.get(productUrl);
      existingProduct = response.data;
      console.log(`✅ Product ${productId} found in Mailchimp.`);
    } catch (error: any) {
      // If the product doesn't exist (404), we will catch the error and create it
      if (error.response?.status === 404) {
        console.log(`❌ Product ${productId} not found in Mailchimp. Proceeding to create new product.`);
      } else {
        // If it's not a 404 error, rethrow the error
        throw error;
      }
    }

    if (existingProduct) {
      // 🔄 2️⃣ Check if update is needed
      if (JSON.stringify(existingProduct) !== JSON.stringify(productData)) {
        console.log(`🔄 Product ${productId} needs to be updated.`);
        try {
          // Update the existing product
          await mailchimpApi.patch(productUrl, productData);
          console.log(`🔄 Updated product ${productId}`);
        } catch (updateError: any) {
          console.error(`❌ Error updating product ${productId}:`, updateError.response?.data || updateError.message);
        }
      } else {
        console.log(`✅ Product ${productId} is already up to date.`);
      }
    } else {
      // ➕ 3️⃣ Create new product if not found
      try {
        console.log(`❌ Creating new product ${productId} in Mailchimp.`);
        await mailchimpApi.post("/products", productData);
        console.log(`✅ Created new product ${productId}`);
      } catch (createError: any) {
        console.error(`❌ Error creating product ${productId}:`, createError.response?.data || createError.message);
      }
    }

    // ⏳ 4️⃣ Add delay to prevent API rate limits
    await delay(1000); // Adjust delay if needed, especially when syncing multiple products

  } catch (error: any) {
    console.error(`❌ Error syncing product ${productData.id}:`, error.response?.data || error.message);
  }
}

export async function syncAllProductsToMailchimp(): Promise<void> {
  try {
    const client = await createSoapClient();
    // Check if username and password are provided
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    // Set language, default to 'EN' if no language is provided
    const language = languageISO || 'EN';
    console.log('Authenticating...');

    // Authenticate and get session token
    const sessionToken = await authenticate(client, username, password);
    console.log('Session token:', sessionToken);
    console.log('Authenticated successfully!');
    // Fetch all products with pagination
    const mailchimpProducts: MailchimpProduct[] = await fetchAllProductsWithPagination(client, sessionToken);

      // Sync or update the product to Mailchimp
      for (const product of mailchimpProducts) {
        console.log(`Syncing product ${JSON.stringify(product, null, 2)} to Mailchimp...`);

        await syncOrUpdateProductToMailchimp(product);
      

    }
    
  } catch (error: any) {
    console.error("❌ Error syncing products to Mailchimp:", error.message);
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