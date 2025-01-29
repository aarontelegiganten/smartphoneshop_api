import axios from 'axios';
import dotenv from 'dotenv';
import { parseStringPromise } from 'xml2js';
import { type Address } from '../models/shop';

dotenv.config();
const serviceKey = process.env.PRESTASHOP_API_KEY;

if (serviceKey == null || serviceKey.trim() === '') {
  throw new Error('Missing required environment variable: PRESTASHOP_API_KEY');
}

const authorizationKey = Buffer.from(`${serviceKey}:`).toString('base64'); // Encode the API key in Base64
console.log('Authorization Key:', `Basic ${authorizationKey}`);
const url = `https://${serviceKey}@mobileadds.eu/api/eutradingorder`;
async function getPrestaShopAddressId(): Promise<string | null> {
  try {
    // Make an axios request to get XML data
    const xmlResponse = await axios.get(url, {
      params: {
        action: 'get_addresses',
      },
      headers: {
        Authorization: `Basic ${authorizationKey}`,
        Accept: 'application/xml',
      },
    });
    const parsedXml = await parseStringPromise(xmlResponse.data as string);
    console.log('Parsed XML:', parsedXml);

    const addressesData = parsedXml.prestashop.addresses[0].address;
    const addresses: Address[] = addressesData.map((address: any) => ({
      id: address.$.id,
      href: address.$['xlink:href'],
    }));
    // return parsedXml;
    return addresses[0].id;
  } catch (error) {
    console.error('Error fetching or parsing XML:', error);
    return null;
  }
}

export default getPrestaShopAddressId;
