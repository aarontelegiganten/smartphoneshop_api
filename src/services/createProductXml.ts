import axios from 'axios';
import type { Prestashop } from '../models/shop'; // Ensure the module exists and is correctly named

function createPrestashopXml(data: Prestashop): string {
  const productsXml = data.products
    .map(
      (product) => `
      <product>
        <id>${product.id}></id>
        <quantity>${product.quantity}></quantity>
      </product>
    `,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
  <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
    <address>
      <id>${data.address.id}</id>
    </address>
    <products>
      ${productsXml}
    </products>
  </prestashop>`;
}

async function sendPrestashopXml(url: string, data: Prestashop): Promise<void> {
  const xmlData = createPrestashopXml(data);

  try {
    const response = await axios.post(url, xmlData, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error sending Prestashop XML:', error);
  }
}

export default sendPrestashopXml;
