import axios from 'axios';

const apiKey = 'T3QJTWF3NVMQ7E63X4PGQFFJVI81MSD3';
const authorizationKey = Buffer.from(`${apiKey}:`).toString('base64'); // Encode the API key in Base64

async function getPrestaShopAddressId(url: string): Promise<any | null> {
  try {
    // Make an axios request to get XML data
    const xmlResponse = await axios.get(url, {
      headers: {
        Accept: 'application/xml',
        Authorization: `Basic ${authorizationKey}`,
      },
    });
    return xmlResponse;
  } catch (error) {
    console.error('Error fetching or parsing XML:', error);
    return null;
  }
}

export default getPrestaShopAddressId;
