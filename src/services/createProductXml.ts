import axios from 'axios';
import dotenv from 'dotenv';
import type { Prestashop } from '../models/shop'; // Ensure the module exists and is correctly named

function createPrestashopXml(data: Prestashop): string {
  const productsXml = data.products
    .map(
      (product) => `
      <product>
        <id>${product.id}></id>
        <quantity>${product.quantity ?? ''}></quantity>
      </product>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <address>
      <id>${data.address.id}</id>
    </address>
    <products>${productsXml}
    </products>
  </prestashop>`;
}
dotenv.config();
const serviceKey = process.env.PRESTASHOP_API_KEY;

if (serviceKey == null || serviceKey.trim() === '') {
  throw new Error('Missing required environment variable: PRESTASHOP_API_KEY');
}

const authorizationKey = Buffer.from(`${serviceKey}:`).toString('base64'); // Encode the API key in Base64
// console.log('Authorization Key:', `Basic ${authorizationKey}`);
const url = `https://${serviceKey}@mobileadds.eu/api/eutradingorder/`;
async function sendPrestashopXml(data: Prestashop): Promise<void> {
  const xmlData = createPrestashopXml(data);

  try {
    const response = await axios.post(url, xmlData, {
      params: {
        action: 'create_order',
      },
      headers: {
        Authorization: `Basic ${authorizationKey}`,
        Accept: 'application/xml',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending Prestashop XML:', error);
  }
}

export default sendPrestashopXml;
