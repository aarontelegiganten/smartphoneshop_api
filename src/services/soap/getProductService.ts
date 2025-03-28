import * as soap from 'soap'; 
import { withRetry } from '@/utils/withRetry';
import { Product } from '@/models/soapProduct';

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

interface ItemsProductResponse {
  items: Array<{
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
          Fields: 'Id,ItemNumber,CustomData,Status,Producer,ProducerId,Title,Discount,Price,Stock' 
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

export async function fetchAllProductsWithPagination(client: soap.Client, sessionToken: string): Promise<Product[]> {
  try {
    const soapHeader = createSoapHeader(sessionToken);
    client.addSoapHeader(soapHeader);

    let page = 1;
    let allProducts: Product[] = [];
    let hasMoreProducts = true;

    while (hasMoreProducts) {
      const productsResponse = await withRetry(async () => {
        return new Promise<ItemsProductResponse>((resolve, reject) => {
          client.Product_GetAll({
            page: page,
            limit: 100, // You can adjust the limit as needed
          }, (err: unknown, response: any) => {
            if (err) reject(new Error(`Error fetching products: ${err}`));

            // Ensure the response is structured as expected
            if (response?.Product_GetAllResult?.items) {
              resolve({ items: response.Product_GetAllResult.items });
            } else {
              resolve({ items: [] }); // Handle case where no products are returned
            }
          });
        });
      });

      // Map the response items to the full Product structure
      const mappedProducts: Product[] = productsResponse.items.map((item: any) => {
        return {
          BuyingPrice: item.BuyingPrice || 0,
          CallForPrice: item.CallForPrice || false,
          CategoryId: item.CategoryId || 0,
          DateCreated: item.DateCreated || '',
          DateUpdated: item.DateUpdated || '',
          Description: item.Description || '',
          DescriptionLong: item.DescriptionLong || '',
          DescriptionShort: item.DescriptionShort || '',
          DisableOnEmpty: item.DisableOnEmpty || false,
          Discount: item.Discount || 0,
          DiscountGroupId: item.DiscountGroupId || 0,
          DiscountType: item.DiscountType || '',
          Ean: item.Ean || '',
          FocusCart: item.FocusCart || false,
          FocusFrontpage: item.FocusFrontpage || false,
          GuidelinePrice: item.GuidelinePrice || 0,
          Id: item.Id,
          ItemNumber: item.ItemNumber,
          ItemNumberSupplier: item.ItemNumberSupplier || '',
          LanguageISO: item.LanguageISO || '',
          MinAmount: item.MinAmount || 0,
          Online: item.Online || false,
          OutOfStockBuy: item.OutOfStockBuy || undefined,
          Price: item.Price,
          ProducerId: item.ProducerId,
          ProductUrl: item.ProductUrl || '',
          RelatedProductIds: item.RelatedProductIds || [],
          RelationCode: item.RelationCode || '',
          SeoCanonical: item.SeoCanonical || '',
          SeoDescription: item.SeoDescription || '',
          SeoKeywords: item.SeoKeywords || '',
          SeoLink: item.SeoLink || '',
          SeoTitle: item.SeoTitle || '',
          Sorting: item.Sorting || 0,
          Status: item.Status || false,
          Stock: item.Stock || 0,
          StockLow: item.StockLow || 0,
          Title: item.Title,
          Type: item.Type || null, // Update this with proper handling if needed
          UnitId: item.UnitId || 0,
          Url: item.Url || '',
          VatGroupId: item.VatGroupId || 0,
          Weight: item.Weight || 0,
          DeliveryId: item.DeliveryId || 0,          // Default value for missing DeliveryId
          DeliveryTimeId: item.DeliveryTimeId || 0,  // Default value for missing DeliveryTimeId
          VariantTypes: item.VariantTypes || '',     // Default empty string for missing VariantTypes
        };
      });

      // Merge the current page products with allProducts
      allProducts = [...allProducts, ...mappedProducts];

      // Check if there are more products (based on the length of the response array)
      hasMoreProducts = productsResponse.items.length === 100; // Assuming 100 items per page
      page++;
    }

    return allProducts;
  } catch (error) {
    throw error;
  }
}
