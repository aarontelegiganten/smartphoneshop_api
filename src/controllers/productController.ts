import axios from "axios";
import * as soap from 'soap';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { createSoapClient, setLanguage } from '@/services/soap/soapClient';
import { authenticate } from '@/services/soap/soapClient';
import { fetchProductById, fetchProductByItemNumber } from '@/services/soap/getProductService';
import { getOrderPayment } from '@/services/soap/getOrderService';
dotenv.config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const languageISO = "DK";

export const getProductController = async (req: Request, res: Response): Promise<any> => {
  // const { productId } = req.params;  // Get productId from request params
  const { productId } = req.body;  // Get username, password, and language from request body

  // Validate productId is a number
  if (!productId || isNaN(Number(productId))) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  // Validate username and password
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Validate languageISO (optional, but you can set a default language like 'EN' or 'DK')
  const language = languageISO || 'EN';  // Default to 'EN' if no language is provided

  try {
    // Create the SOAP client
    const client = await createSoapClient();

    // Authenticate and get the session token
    if (!username || !password) {
      throw new Error('Username and password must be defined');
    }
   
 
    const sessionToken = await authenticate(client, username, password);

    // Set the language (optional, but will ensure the correct language for the response)
    await setLanguage(client, language);

    // Fetch the product using the session token
    const product = await fetchProductById(client, sessionToken, Number(productId));

    // Check if product was found
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Return the fetched product
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



const VPNR = process.env.YUKATEL_VPNR;
const AUTH_CODE = process.env.YUKATEL_AUTH_CODE;
const EAN = process.env.YUKATEL_EAN;

// Validate environment variables
if (!VPNR || !AUTH_CODE) {
  console.error('Missing required environment variables:');
  console.error('YUKATEL_VPNR:', VPNR ? 'Present' : 'Missing');
  console.error('YUKATEL_AUTH_CODE:', AUTH_CODE ? 'Present' : 'Missing');
  throw new Error('Missing required environment variables for Yukatel API');
}

const STOCK_LIST_URL = `https://api.yukatel.de/api/stock-list?vpnr=${VPNR}&authcode=${AUTH_CODE}&ean=1`;


export async function getProductByItemNumberController(req: Request, res: Response) {
  try {
    const { itemNumber } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const language = languageISO || "EN";
    const client = await createSoapClient();
    const sessionToken = await authenticate(client, username, password);
    await setLanguage(client, language);
    
    const product = await fetchProductByItemNumber(client, sessionToken, itemNumber);
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateProductController(req: Request, res: Response) {
  try {
    const { itemNumber, stock } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (!itemNumber ||  stock === undefined) {
      return res.status(400).json({ message: "ItemNumber and stock are required" });
    }

    const stockInt = parseInt(stock, 10);

    if (isNaN(stockInt)) {
      return res.status(400).json({ message: "Stock must be an integer" });
    }

    const client = await createSoapClient();
    const sessionToken = await authenticate(client, username, password);

    // Fetch the product data
    const productResponse = await fetchProductByItemNumber(client, sessionToken, itemNumber);

    // Ensure the response contains items
    if (!productResponse?.item?.[0]) {
      console.log('No product found in response');
      return res.status(404).json({ message: "Product not found" });
    }

    // Extract the first product from the array
    const product = productResponse.item[0];

    await new Promise((resolve, reject) => {
      client.Product_Update(
        {
          sessionToken,
          ProductData: {
            Id: product.Id,
            Stock: stockInt
          }
        },
        (err: any, result: { Product_UpdateResult: number[] }) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    return res.status(200).json({ message: `Product ${itemNumber} (ID: ${product.Id}) updated successfully` });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function fetchStockListWithRetry(maxRetries = 3): Promise<any[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(STOCK_LIST_URL);
      
      if (!response.data) {
        return [];
      }

      if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        const possibleArrays = Object.entries(response.data)
          .filter(([_, value]) => Array.isArray(value))
          .map(([key, value]) => ({ key, length: (value as any[]).length }));

        if (possibleArrays.length > 0) {
          const arrayKey = possibleArrays[0].key;
          return response.data[arrayKey];
        }
        return [];
      }
      
      return response.data;
    } catch (error: any) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return [];
}

async function updateProductWithRetry(
  client: soap.Client,
  sessionToken: string,
  stockItem: { articelno: string; quantity: string },
  maxRetries = 3
): Promise<void> {
  const { articelno: articleNo, quantity } = stockItem;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to update product ${articleNo} (attempt ${attempt}/${maxRetries})`);
      const productResponse = await fetchProductByItemNumber(client, sessionToken, articleNo);
      
      if (!productResponse?.item?.[0]) {
        console.log(`Product ${articleNo} not found`);
        return;
      }

      const product = productResponse.item[0];
      const stockInt = parseInt(quantity, 10);
      
      if (isNaN(stockInt)) {
        console.log(`Invalid stock quantity for product ${articleNo}: ${quantity}`);
        return;
      }

      await new Promise((resolve, reject) => {
        const updateData = {
          sessionToken,
          ProductData: {
            Id: product.Id,
            Stock: stockInt
          }
        };
        
        client.Product_Update(
          updateData,
          (err: any, result: { Product_UpdateResult: number[] }) => {
            if (err) {
              console.error(`Error updating product ${articleNo}:`, err);
              reject(err);
            } else {
              console.log(`Successfully updated product ${articleNo} to stock ${stockInt}`);
              resolve(result);
            }
          }
        );
      });

      return;
    } catch (error) {
      console.error(`Error updating product ${articleNo} (attempt ${attempt}/${maxRetries}):`, error);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export async function fetchAndUpdateStock() {
  let client: soap.Client | undefined;
  const startTime = Date.now();
  try {
    console.log('Starting stock update process...');
    client = await createSoapClient();
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    console.log('Authenticating...');
    const sessionToken = await authenticate(client, username, password);
    
    console.log('Fetching stock list...');
    const stockList = await fetchStockListWithRetry();
    
    if (!stockList || stockList.length === 0) {
      console.log('No stock items found to update');
      return;
    }

    console.log(`Found ${stockList.length} items to update`);

    const articleNoProperty = 'articelno';
    
    if (!stockList[0].hasOwnProperty(articleNoProperty)) {
      console.log('Invalid stock list format');
      return;
    }

    const BATCH_SIZE = 5;
    const totalBatches = Math.ceil(stockList.length / BATCH_SIZE);
    
    for (let i = 0; i < stockList.length; i += BATCH_SIZE) {
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const batch = stockList.slice(i, i + BATCH_SIZE);
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);
      
      if (!client) {
        throw new Error("SOAP client is not initialized");
      }
      const currentClient = client;
      await Promise.all(
        batch.map(stockItem => updateProductWithRetry(currentClient, sessionToken, stockItem))
      );
    }

    const endTime = Date.now();
    console.log(`Stock update completed in ${(endTime - startTime) / 1000} seconds`);
  } catch (error) {
    console.error('Error in fetchAndUpdateStock:', error);
    throw error;
  }
}

export async function getOrderPaymentController(req: Request, res: Response) {
  try {
    const { orderId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const language = languageISO || "EN";
    const client = await createSoapClient();
    const sessionToken = await authenticate(client, username, password);
    await setLanguage(client, language);
    
    const orderpayment = await getOrderPayment(client, sessionToken, orderId);
    return res.status(200).json(orderpayment);
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}