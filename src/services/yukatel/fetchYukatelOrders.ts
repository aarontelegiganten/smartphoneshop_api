import axios from 'axios';
import dotenv from 'dotenv';
import { YukatelOrdersResponse } from '@/models/YukatelOrdersResponse';
import { YukatelOrderResponse } from '@/models/YukatelOrderResponse';
dotenv.config();




export async function fetchYukatelOrders(authcode: string, vpnr: number): Promise<YukatelOrdersResponse> {
    try {
      const apiUrl = 'https://api.yukatel.de/api/orders';
  
      // Set up the request parameters
      const params = {
        authcode,
        vpnr,
      };
  
      const headers = {
        'accept': 'application/json',
      };
  
      // Perform the GET request
      const response = await axios.get<YukatelOrdersResponse>(apiUrl, { params, headers });
  
      return response.data; // Return the structured response
    } catch (error) {
      console.error('Error fetching Yukatel orders:', error);
      throw error;
    }
  }
  
//   fetchYukatelOrders(authcode, vpnr)
//   .then(response => {
//     console.log('Fetched Yukatel Orders:', response.data); // Logs the actual order list
//   })
//   .catch(error => {
//     console.error('Failed to fetch orders:', error);
//   });



export async function fetchYukatelOrderById(
  orderId: number,
  authcode: string,
  vpnr: number
): Promise<YukatelOrderResponse | null> {
  try {
    const apiUrl = `https://api.yukatel.de/api/orders/${orderId}`;
    const params = { authcode, vpnr };
    const headers = { accept: 'application/json' };

    const response = await axios.get(apiUrl, { params, headers });

    return response.data as YukatelOrderResponse;
  } catch (error: any) {
    console.error(`❌ Error fetching order ${orderId}:`, error?.response?.data || error.message);
    return null;
  }
}
