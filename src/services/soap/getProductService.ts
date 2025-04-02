import * as soap from 'soap';
import { withRetry } from '@/utils/withRetry';
// import { Product } from '@/models/soapProduct';
import { MailchimpProduct, MailchimpProductImage, MailchimpProductVariant } from '@/models/mailchimpProduct';
import { url } from 'inspector';

// Interfaces
interface ProductResponse {
  item: Array<{
    Id: number;
    ProducerId: number;
    Producer: {
      Id: number;
    };
    Status: boolean;
    Stock: number;
    ItemNumber: string;
    Price: number;
    Discount: number;
    Title: string;
    CustomData: any;
  }>;
}

// interface ItemsProductResponse {
//   items: Array<{
//     Id: number;
//     ProducerId: number;
//     Producer: {
//       Id: number;
//     };
//     Status: boolean;
//     Stock: number;
//     ItemNumber: string;
//     Price: number;
//     Discount: number;
//     Title: string;
//     CustomData: any;
//     Variants: ProductVariant[];
//   }>;
// }

interface CategoryResponse {
  Category_GetByIdResult: {
    Id: number;
    Name: string;
  };
}

interface SoapError {
  code: string;
  message: string;
  details?: unknown;
}

interface SoapHeader {
  sessionToken: string;
  uniqueRequest: string;
}
export interface ProductVariant {
  Id: number;
  Title: string;

}
// Utility functions
function validateProductId(productId: number): void {
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error(`Invalid product ID: ${productId}`);
  }
}

function validateItemNumber(itemNumber: string): void {
  if (!itemNumber || typeof itemNumber !== 'string' || itemNumber.trim() === '') {
    throw new Error(`Invalid item number: ${itemNumber}`);
  }
}

function createSoapHeader(sessionToken: string): SoapHeader {
  return {
    sessionToken,
    uniqueRequest: Date.now().toString()
  };
}

// Main functions
export async function fetchProductById(client: soap.Client, sessionToken: string, productId: number) {
  try {
    validateProductId(productId);
    const soapHeader = createSoapHeader(sessionToken);
    client.addSoapHeader(soapHeader);

    // Setting fields for the product
    await withRetry(async () => {
      await new Promise<void>((resolve, reject) => {
        client.Product_SetFields({
          Fields: 'Id,ItemNumber,CustomData,Status,Producer,ProducerId,Title,Discount,Price,Stock,Description,BuyingPrice,Pictures,Variants,DateCreated,DateUpdated,Url'
        }, (err: unknown) => {
          if (err) reject(new Error(`Error setting product fields: ${err}`));
          resolve();
        });
      });
    });

    // Setting variant fields for the product
    await withRetry(async () => {
      await new Promise<void>((resolve, reject) => {
        client.Product_SetVariantFields({ Fields: 'Id' }, (err: unknown) => {
          if (err) reject(new Error(`Error setting variant fields: ${err}`));
          resolve();
        });
      });
    });

    // Fetching product by ID
    return await withRetry(async () => {
      return new Promise<ProductResponse>((resolve, reject) => {
        client.Product_GetById({ ProductId: Math.floor(productId) }, (err: unknown, response: any) => {
          if (err) reject(new Error(`Error fetching product: ${err}`));
          resolve({ item: response?.Product_GetByIdResult ? [response.Product_GetByIdResult] : [] });
        });
      });
    });
  } catch (error) {
    throw error;
  }
}

export async function fetchProductByItemNumber(client: soap.Client, sessionToken: string, itemNumber: string) {
  try {
    validateItemNumber(itemNumber);
    const soapHeader = createSoapHeader(sessionToken);
    client.addSoapHeader(soapHeader);

    // Setting fields for the product
    await withRetry(async () => {
      await new Promise<void>((resolve, reject) => {
        client.Product_SetFields({
          Fields: 'Id,ItemNumber,CustomData,Status,Producer,ProducerId,Title,Discount,Price,Pictures,Stock,Variants'
        }, (err: unknown) => {
          if (err) reject(new Error(`Error setting product fields: ${err}`));
          resolve();
        });
      });
    });

    // Setting variant fields for the product
    await withRetry(async () => {
      await new Promise<void>((resolve, reject) => {
        client.Product_SetVariantFields({ Fields: 'Id,Title,PictureId' }, (err: unknown) => {
          if (err) reject(new Error(`Error setting variant fields: ${err}`));
          resolve();
        });
      });
    });

    // Fetching product by item number
    return await withRetry(async () => {
      return new Promise<ProductResponse>((resolve, reject) => {
        client.Product_GetByItemNumber({ ItemNumber: itemNumber }, (err: unknown, response: any) => {
          if (err) reject(new Error(`Error fetching product: ${err}`));

          // Handling response structure for item number
          const result = response?.Product_GetByItemNumberResult?.item;
          resolve({ item: Array.isArray(result) ? result : [] });
        });
      });
    });
  } catch (error) {
    throw error;
  }
}

export async function fetchProductsByCategory(client: soap.Client, sessionToken: string, categoryId: number) {
  try {
    validateProductId(categoryId);
    const soapHeader = createSoapHeader(sessionToken);
    client.addSoapHeader(soapHeader);

    // Fetching products by category
    const productsResponse = await withRetry(async () => {
      return new Promise<ProductResponse>((resolve, reject) => {
        client.Product_GetByCategory({ CategoryId: Math.floor(categoryId) }, (err: unknown, response: any) => {
          if (err) reject(new Error(`Error fetching products by category: ${err}`));
          resolve({ item: response?.Product_GetByCategoryResult?.items || [] });
        });
      });
    });

    return productsResponse.item || [];
  } catch (error) {
    throw error;
  }
}

export async function fetchCategoryById(client: soap.Client, sessionToken: string, categoryId: number) {
  try {
    validateProductId(categoryId);
    const soapHeader = createSoapHeader(sessionToken);
    client.addSoapHeader(soapHeader);

    // Fetching category by ID
    const category = await withRetry(async () => {
      return new Promise<CategoryResponse>((resolve, reject) => {
        client.Category_GetById({ CategoryId: Math.floor(categoryId) }, (err: unknown, response: any) => {
          if (err) reject(new Error(`Error fetching category: ${err}`));
          if (response?.Category_GetByIdResult) {
            resolve(response as CategoryResponse);
          } else {
            reject(new Error('Failed to fetch category: No valid response field'));
          }
        });
      });
    });

    return category.Category_GetByIdResult;
  } catch (error) {
    throw error;
  }
}


// export async function fetchAllProductsWithPagination(client: soap.Client, sessionToken: string): Promise<MailchimpProduct[]> {
//   try {
//     const soapHeader = createSoapHeader(sessionToken);
//     client.addSoapHeader(soapHeader);

//     // Set required fields for fetching products
//     await withRetry(async () => {
//       await new Promise<void>((resolve, reject) => {
//         client.Product_SetFields({
//           Fields: 'Id,Title,Price,Pictures,Description,Url,Variants' // Ensure Variants is included
//         }, (err: unknown) => {
//           if (err) {
//             console.error(`Error setting product fields: ${err}`);
//             reject(new Error(`Error setting product fields: ${err}`));
//           }
//           resolve();
//         });
//       });
//     });

//     // Set required fields for fetching variants
//     await withRetry(async () => {
//       await new Promise<void>((resolve, reject) => {
//         client.Product_SetVariantFields({ Fields: 'Id,Title' }, (err: unknown) => {
//           if (err) {
//             console.error(`Error setting variant fields: ${err}`);
//             reject(new Error(`Error setting variant fields: ${err}`));
//           }
//           resolve();
//         });
//       });
//     });

//     let page = 1;
//     let allProducts: Product[] = [];
//     let hasMoreProducts = true;

//     while (hasMoreProducts) {
//       const productsResponse = await withRetry(async () => {
//         return new Promise<ItemsProductResponse>((resolve, reject) => {
//           client.Product_GetAll({
//             page: page,
//             limit: 100, // Adjust as needed
//           }, (err: unknown, response: any) => {
//             if (err) {
//               console.error(`Error fetching products: ${err}`);
//               reject(new Error(`Error fetching products: ${err}`));
//               return;
//             }

//             // Log full raw API response for debugging
//             // console.log('Raw API Response:', JSON.stringify(response, null, 2));

//             // Ensure response structure is as expected
//             const products = response?.Product_GetAllResult?.item || []; // Handle both array and single object cases
//             resolve({ items: Array.isArray(products) ? products : [products] });
//           });
//         });
//       });

//       // Log fetched items
//       // console.log('Fetched Products on page', page, productsResponse.items);

//       // Map the response items to required fields
//       const mappedProducts: Product[] = productsResponse.items.map((item: any) => {
//         // Debugging: Log Variants structure
//         console.log(`Raw Variants Data for Product ID ${item.Id}:`, JSON.stringify(item.Variants, null, 2));

//         return {
//           Id: item.Id, // Product ID
//           Title: item.Title, // Product Title
//           Price: item.Price, // Product Price
//           url: item.Url || '', // Product URL
//           Description: item.Description || '', // Default to empty if missing
//           Pictures: Array.isArray(item.Pictures?.item)
//             ? item.Pictures.item.map((pic: any) => pic.FileName).filter(Boolean) // Extract FileName, remove undefined
//             : [], // Default to empty array if no pictures exist
//           Variants: Array.isArray(item.Variants?.item)
//             ? item.Variants.item.map((variant: any) => ({
//               Id: variant?.Id || 0,
//               Title: variant?.Title || '',
//             }))
//             : item.Variants && typeof item.Variants === 'object'
//               ? [{ Id: item.Variants.Id || 0, Title: item.Variants.Title || '' }] // Handle single object case
//               : [], // Default to empty array if no variants exist
//         };
//       });

//       // Log mapped products
//       console.log('Mapped Products:', mappedProducts);

//       // Merge current page products with allProducts
//       allProducts = [...allProducts, ...mappedProducts];

//       // Check if more products exist based on response length
//       hasMoreProducts = productsResponse.items.length === 100; // Assuming 100 items per page
//       page++;
//     }

//     // Log final products array
//     // console.log('All Fetched Products:', allProducts);
//     const IMAGE_BASE_URL = "https://shop99794.sfstatic.io/upload_dir/";

// const mappedProductsForMailchimp: any = allProducts.map((item: any) => {
//   const mailchimpImages = Array.isArray(item.Pictures?.item)
//     ? item.Pictures.item
//         .filter((pic: any) => pic.FileName) // ✅ Ensure FileName exists
//         .map((pic: any) => ({
//           id: pic.Id?.toString() || "", // ✅ Ensure ID is a string
//           url: `${IMAGE_BASE_URL}${pic.FileName.replace(/^(\.\.\/)+/, "")}` // ✅ Remove '../' safely
//         }))
//     : [];

//   return {
//     id: item.Id.toString(),
//     title: item.Title,
//     price: item.Price.toString(),
//     description: item.Description || '',
//     url: item.Url || '',
//     images: mailchimpImages,
//     variants: item.Variants,
//   };
// });



//     return mappedProductsForMailchimp;
//   } catch (error) {
//     console.error('Error in fetchAllProductsWithPagination:', error);
//     throw error;
//   }
// }






interface SoapPicture {
  Id?: any;
  FileName?: string;
}

interface SoapVariantSimple {
  Id?: any;
  Title?: string;
}

interface SoapProductItem {
  Id: any;
  Title: string;
  Price: number;
  Url?: string;
  Description?: string;
  Pictures?: { item?: SoapPicture | SoapPicture[] };
  Variants?: { item?: SoapVariantSimple | SoapVariantSimple[] };
}

interface ItemsProductResponse {
  items: SoapProductItem[];
}

// --- Interface for intermediate Product structure ---
interface Product {
  Id: any;
  Title: string;
  Price: number;
  url: string;
  Description: string;
  Pictures: { Id: any; FileName: string }[];
  Variants: { Id: any; Title: string }[];
}

// --- Helper function ---
function mapSoapItems<TInput, TOutput>(
    soapData: { item?: TInput | TInput[] } | undefined,
    mapper: (item: TInput) => TOutput | null
): TOutput[] {
    if (!soapData || !soapData.item) {
        return [];
    }
    const items = soapData.item;
    if (Array.isArray(items)) {
        return items.map(mapper).filter(item => item !== null) as TOutput[];
    } else if (typeof items === 'object' && items !== null) {
        const mapped = mapper(items);
        return mapped ? [mapped] : [];
    }
    return [];
}




// --- Main Function ---
// Return type uses the imported MailchimpProduct which expects image_url in images array items
// export async function fetchAllProductsWithPagination(client: soap.Client, sessionToken: string): Promise<MailchimpProduct[]> {
//   try {
//     const soapHeader = createSoapHeader(sessionToken);
//     client.addSoapHeader(soapHeader);

//     await withRetry(async () => {
//       await new Promise<void>((resolve, reject) => {
//         client.Product_SetFields({
//           Fields: 'Id,Title,Price,Pictures,Description,Url,Variants'
//         }, (err: unknown) => {
//           if (err) reject(new Error(`Error setting product fields: ${err}`)); else resolve();
//         });
//       });
//     });

//     let page = 1;
//     let allProducts: Product[] = [];
//     let hasMoreProducts = true;
//     const IMAGE_BASE_URL = "https://shop99794.sfstatic.io/upload_dir/";

//     while (hasMoreProducts) {
//       const productsResponse = await withRetry(async () => {
//           return new Promise<ItemsProductResponse>((resolve, reject) => {
//               client.Product_GetAll({
//                   page: page,
//                   limit: 100,
//               }, (err: unknown, response: any) => {
//                   if (err) {
//                       console.error(`Error fetching products on page ${page}:`, err);
//                       return reject(new Error(`Error fetching products on page ${page}: ${err}`));
//                   }
//                   const items = response?.Product_GetAllResult?.item;
//                   const productsArray = items ? (Array.isArray(items) ? items : [items]) : [];
//                   resolve({ items: productsArray as SoapProductItem[] });
//               });
//           });
//       });

//       const mappedProducts: Product[] = productsResponse.items.map((item: SoapProductItem): Product => {
//           const mappedPictures = mapSoapItems(item.Pictures, (pic) => {
//               if (pic && pic.FileName) {
//                   return { Id: pic.Id, FileName: pic.FileName };
//               }
//               return null;
//           });

//           const mappedVariants = mapSoapItems(item.Variants, (variant) => {
//               if (variant) {
//                 const variantId = variant.Id ?? `generated-${Math.random().toString(36).substring(2, 15)}`;
//                 return {
//                     Id: variantId,
//                     Title: variant.Title ?? '',
//                 };
//               }
//               return null;
//           });

//           return {
//               Id: item.Id,
//               Title: item.Title,
//               Price: item.Price,
//               url: item.Url || '',
//               Description: item.Description || '',
//               Pictures: mappedPictures,
//               Variants: mappedVariants,
//           };
//       });

//       allProducts = [...allProducts, ...mappedProducts];
//       hasMoreProducts = productsResponse.items.length === 100;
//       page++;
//       // console.log(`Fetched page ${page - 1}, total products so far: ${allProducts.length}`);
//     }

//     // console.log(`Finished fetching. Total products: ${allProducts.length}. Starting Mailchimp mapping...`);

//     // Map to final MailchimpProduct structure, conforming to the IMPORTED type definition
//     const mappedProductsForMailchimp: MailchimpProduct[] = allProducts.map((item: Product): MailchimpProduct => {

//       // Map images using 'image_url' to satisfy the imported MailchimpProductImage type
//       const mailchimpImages: MailchimpProductImage[] = item.Pictures.map((pic): MailchimpProductImage => {
//           const imageId = pic.Id?.toString() || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
//           return {
//             id: imageId,
//             image_url: `${IMAGE_BASE_URL}${pic.FileName.replace(/^(\.\.\/)+/, "")}` // <<< CHANGE BACK to 'image_url'
//           };
//       });

//       const primaryImageUrl = item.Pictures.length > 0
//           ? `${IMAGE_BASE_URL}${item.Pictures[0].FileName.replace(/^(\.\.\/)+/, "")}`
//           : "";

//       let mailchimpVariants: MailchimpProductVariant[] = item.Variants.map((variant): MailchimpProductVariant => {
//           const variantIdStr = variant.Id?.toString() || `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
//           const sku = `SKU-${item.Id}-${variantIdStr}`;
//           return {
//             id: variantIdStr,
//             title: variant.Title || 'Default Variant',
//             price: item.Price ?? 0,
//             sku: sku,
//             inventory_quantity: 0,
//           };
//        });

//        if (mailchimpVariants.length === 0) {
//            const defaultVariantId = `${item.Id?.toString() || 'product'}-default`;
//            mailchimpVariants.push({
//                id: defaultVariantId,
//                title: item.Title || 'Default',
//                price: item.Price || 0,
//                sku: `SKU-${item.Id?.toString() || 'product'}-DEFAULT`,
//                inventory_quantity: 0,
//            });
//        }

//       // Construct MailchimpProduct object (ensure it matches the imported MailchimpProduct definition)
//       const mailchimpProduct: MailchimpProduct = {
//           id: item.Id.toString(),
//           title: item.Title,
//           description: item.Description || '',
//           url: item.url || undefined,
//           image_url: primaryImageUrl, // Top-level primary image URL
//           images: mailchimpImages,    // Array uses objects with 'image_url' field now
//           variants: mailchimpVariants,
//           // Ensure ALL required fields from the imported MailchimpProduct are present
//           // If type/vendor ARE required by the import, add defaults back:
//           // type: "Physical",
//           // vendor: "YourVendorName",
//       };
//       return mailchimpProduct;
//     });

//     // console.log(`Finished mapping ${mappedProductsForMailchimp.length} products for Mailchimp.`);
//     return mappedProductsForMailchimp;

//   } catch (error) {
//     console.error(`Failed during product fetch or mapping process:`, error);
//     throw new Error(`Product fetching and mapping failed: ${error instanceof Error ? error.message : String(error)}`);
//   }
// }

// --- Main Function ---
export async function fetchAllProductsWithPagination(client: soap.Client, sessionToken: string): Promise<MailchimpProduct[]> {
  try {
    const soapHeader = createSoapHeader(sessionToken);
    client.addSoapHeader(soapHeader);

    await withRetry(async () => {
      await new Promise<void>((resolve, reject) => {
        client.Product_SetFields({
          Fields: 'Id,Title,Price,Pictures,Description,Url,Variants'
        }, (err: unknown) => {
          if (err) reject(new Error(`Error setting product fields: ${err}`)); else resolve();
        });
      });
    });

    let page = 1;
    let allProducts: Product[] = [];
    let hasMoreProducts = true;
    const IMAGE_BASE_URL = "https://shop99794.sfstatic.io/upload_dir/";

    while (hasMoreProducts) {
      const productsResponse = await withRetry(async () => {
          return new Promise<ItemsProductResponse>((resolve, reject) => {
              client.Product_GetAll({
                  page: page,
                  limit: 100,
              }, (err: unknown, response: any) => {
                  if (err) {
                      console.error(`Error fetching products on page ${page}:`, err);
                      return reject(new Error(`Error fetching products on page ${page}: ${err}`));
                  }
                  const items = response?.Product_GetAllResult?.item;
                  const productsArray = items ? (Array.isArray(items) ? items : [items]) : [];
                  resolve({ items: productsArray as SoapProductItem[] });
              });
          });
      });

      const mappedProducts: Product[] = productsResponse.items.map((item: SoapProductItem): Product => {
          const mappedPictures = mapSoapItems(item.Pictures, (pic) => {
              if (pic && pic.FileName) {
                  return { Id: pic.Id, FileName: pic.FileName };
              }
              return null;
          });

          const mappedVariants = mapSoapItems(item.Variants, (variant) => {
              if (variant) {
                const variantId = variant.Id ?? `generated-${Math.random().toString(36).substring(2, 15)}`;
                return {
                    Id: variantId,
                    Title: variant.Title ?? '',
                };
              }
              return null;
          });

          return {
              Id: item.Id,
              Title: item.Title,
              Price: item.Price,
              url: item.Url || '',
              Description: item.Description || '',
              Pictures: mappedPictures,
              Variants: mappedVariants,
          };
      });

      allProducts = [...allProducts, ...mappedProducts];
      hasMoreProducts = productsResponse.items.length === 100;
      page++;
      // console.log(`Fetched page ${page - 1}, total products so far: ${allProducts.length}`);
    }
    const mappedProductsForMailchimp: MailchimpProduct[] = allProducts.map((item: Product): MailchimpProduct => {

        // Map images using 'url' to satisfy the ACTUAL Mailchimp API requirement
      const mailchimpImages: MailchimpProductImage[] = item.Pictures.map((pic): MailchimpProductImage => { // Use the (soon to be corrected) imported type
          const imageId = pic.Id?.toString() || `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          return {
            id: imageId,
            url: `${IMAGE_BASE_URL}${pic.FileName.replace(/^(\.\.\/)+/, "")}` // <<< CHANGE BACK to 'url'
          };
      });

      const primaryImageUrl = item.Pictures.length > 0
          ? `${IMAGE_BASE_URL}${item.Pictures[0].FileName.replace(/^(\.\.\/)+/, "")}`
          : "";

      let mailchimpVariants: MailchimpProductVariant[] = item.Variants.map((variant): MailchimpProductVariant => {
          const variantIdStr = variant.Id?.toString() || `var-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const sku = `SKU-${item.Id}-${variantIdStr}`;
          return {
            id: variantIdStr,
            title: variant.Title || 'Default Variant',
            price: item.Price ?? 0,
            sku: sku,
            inventory_quantity: 0,
          };
       });

       if (mailchimpVariants.length === 0) {
           const defaultVariantId = `${item.Id?.toString() || 'product'}-default`;
           mailchimpVariants.push({
               id: defaultVariantId,
               title: item.Title || 'Default',
               price: item.Price || 0,
               sku: `SKU-${item.Id?.toString() || 'product'}-DEFAULT`,
               inventory_quantity: 0,
           });
       }

      // Construct MailchimpProduct object
      const mailchimpProduct: MailchimpProduct = { // Use the imported type
          id: item.Id.toString(),
          title: item.Title,
          description: item.Description || '',
          url: item.url || undefined, // Product URL
          image_url: primaryImageUrl, // Top-level primary image URL (assuming this name is correct for the top level)
          images: mailchimpImages,    // Array uses objects with 'url' field now
          variants: mailchimpVariants,
          // Add back type/vendor if they ARE required by your specific imported MailchimpProduct interface
          // type: "Physical",
          // vendor: "YourVendorName",
      };
      return mailchimpProduct;
    });

    return mappedProductsForMailchimp;

  } catch (error) {
    console.error(`Failed during product fetch or mapping process:`, error);
    throw new Error(`Product fetching and mapping failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}