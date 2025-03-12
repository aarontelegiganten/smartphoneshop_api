import { Request, Response } from 'express';
import { createSoapClient, setLanguage } from '@/services/soap/soapClient';
import { authenticate } from '@/services/soap/soapClient';
import { fetchProductById } from '@/services/soap/getProductService';

import dotenv from 'dotenv';

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