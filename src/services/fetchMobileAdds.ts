import axios from 'axios';
import { parseStringPromise } from 'xml2js';

async function getXmlData(url: string): Promise<any> {
  try {
    // Make an axios request to get XML data
    const xmlResponse = await axios.get(url, {
      headers: {
        Accept: 'application/xml',
      },
    });

    // Parse the XML response
    const parsedXml = await parseStringPromise(xmlResponse.data);
    console.log('Parsed XML:', parsedXml);

    return parsedXml;
  } catch (error) {
    console.error('Error fetching XML data:', error);
    throw error;
  }
}

export default getXmlData;
