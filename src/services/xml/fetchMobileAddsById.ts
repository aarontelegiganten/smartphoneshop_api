import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import MobileAddsProduct from '@/models/mobileaddsproduct';

async function fetchMobileAddsById(url: string, productId: string): Promise<MobileAddsProduct | null> {
  try {
    // Make an axios request to get XML data
    const xmlResponse = await axios.get(url, {
      headers: {
        Accept: 'application/xml',
      },
      params: {
        product_id: productId,
      },
    });

    // Parse the XML response
    const parsedXml = await parseStringPromise(xmlResponse.data as string);
    // console.log('Parsed XML:', parsedXml);

    // Assuming the XML structure has a root element named 'product'
    const productsData: MobileAddsProduct[] = parsedXml.products?.product;
    if (!Array.isArray(productsData) || productsData.length === 0) {
      throw new Error('Invalid XML structure: Missing <product> element');
    }

    const productData = productsData[0];
    // Create an instance of MobileAddsProduct
    const product = new MobileAddsProduct(productData);

    return product;
  } catch (error) {
    console.error('Error fetching or parsing XML:', error);
    return null;
  }
}

export default fetchMobileAddsById;
