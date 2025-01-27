import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import MobileAddsProduct from '../models/mobileaddsproduct';

async function fetchMobileAdds(url: string): Promise<MobileAddsProduct[]> {
  try {
    // Make an axios request to get XML data
    const xmlResponse = await axios.get(url, {
      headers: {
        Accept: 'application/xml',
      },
    });

    // Parse the XML response
    const parsedXml = await parseStringPromise(xmlResponse.data as string);
    // console.log('Parsed XML:', parsedXml);

    // Assuming the XML structure has a root element named 'products' containing multiple 'product' elements
    const productsData = parsedXml.products.product;
    if (!Array.isArray(productsData)) {
      throw new Error('Invalid XML structure: Missing <products> or <product> elements');
    }

    // Map the parsed XML data to instances of MobileAddsProduct
    const products: MobileAddsProduct[] = productsData.map((productData: any) => new MobileAddsProduct(productData));

    return products;
  } catch (error) {
    console.error('Error fetching or parsing XML:', error);
    throw error;
  }
}

export default fetchMobileAdds;
