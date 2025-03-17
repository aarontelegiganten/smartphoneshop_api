import * as soap from 'soap'; 
import { Product, ProductGetByIdResponse } from "@/models/soapProduct"; 

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

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

interface CategoryResponse {
  Category_GetByIdResult: {
    Id: number;
    Name: string;
    // Add other category fields as needed
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

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Operation failed after retries');
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

    await withRetry(async () => {
      await new Promise<void>((resolve, reject) => {
        client.Product_SetVariantFields({ Fields: 'Id' }, (err: unknown) => {
          if (err) reject(new Error(`Error setting variant fields: ${err}`));
          resolve();
        });
      });
    });

    return await withRetry(async () => {
      return new Promise<ProductResponse>((resolve, reject) => {
        client.Product_GetById({ ProductId: Math.floor(productId) }, (err: unknown, response: unknown) => {
          if (err) reject(new Error(`Error fetching product: ${err}`));
          resolve({ item: response as any[] });
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

    await withRetry(async () => {
      await new Promise<void>((resolve, reject) => {
        client.Product_SetVariantFields({ Fields: 'Id' }, (err: unknown) => {
          if (err) reject(new Error(`Error setting variant fields: ${err}`));
          resolve();
        });
      });
    });

    return await withRetry(async () => {
      return new Promise<ProductResponse>((resolve, reject) => {
        client.Product_GetByItemNumber({ ItemNumber: itemNumber }, (err: unknown, response: unknown) => {
          if (err) {
            reject(new Error(`Error fetching product: ${err}`));
            return;
          }
          
          // Handle the response structure
          const result = response as any;
          if (result?.Product_GetByItemNumberResult?.item) {
            resolve({ item: result.Product_GetByItemNumberResult.item });
          } else if (Array.isArray(result)) {
            resolve({ item: result });
          } else {
            resolve({ item: [] });
          }
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

    const productsResponse = await withRetry(async () => {
      return new Promise<ProductResponse>((resolve, reject) => {
        client.Product_GetByCategory({ CategoryId: Math.floor(categoryId) }, (err: unknown, response: unknown) => {
          if (err) reject(new Error(`Error fetching products by category: ${err}`));
          resolve({ item: response as any[] });
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

    const category = await withRetry(async () => {
      return new Promise<CategoryResponse>((resolve, reject) => {
        client.Category_GetById({ CategoryId: Math.floor(categoryId) }, (err: unknown, response: unknown) => {
          if (err) reject(new Error(`Error fetching category: ${err}`));
          if (response && typeof response === 'object' && 'Category_GetByIdResult' in response) {
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
