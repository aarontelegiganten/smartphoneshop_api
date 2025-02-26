import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
// --- Configuration ---
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_STORE_ID = process.env.MAILCHIMP_STORE_ID;
const MAILCHIMP_DC = process.env.MAILCHIMP_DC;

const mailchimpApi = axios.create({
  baseURL: `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/ecommerce/stores/${MAILCHIMP_STORE_ID}`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
  },
});

// ✅ Function to Sync or Update Product
export async function syncOrUpdateProductToMailchimp(productData: any): Promise<void> {
  try {
    const productId = productData.id;
    if (!productId) {
      throw new Error('Product ID is required');
    }

    // 1️⃣ Check if Product Exists in Mailchimp
    const productUrl = `/products/${productId}`;
    const response = await mailchimpApi.get(productUrl);

    if (response.status === 200) {
      console.log(response.data)
      // ✅ Product Exists → Update it (PATCH)
      await mailchimpApi.patch(productUrl, productData);
      console.log(`🔄 Updated product ${productId}`);
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      // ❌ Product Not Found → Create it (POST)
      try {
        await mailchimpApi.post('/products', productData);
        console.log(`✅ Created new product ${productData.id}`);
      } catch (createError: any) {
        console.error(`❌ Failed to create product ${productData.id}:`, createError.response?.data || createError.message);
      }
    } else {
      console.error(`❌ Error syncing product ${productData.id}:`, error.response?.data || error.message);
    }
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
