import axios from 'axios';
import dotenv from 'dotenv';
import { YukatelOrdersResponse } from '@/models/YukatelOrders';
dotenv.config();




export async function fetchYukatelOrders(authcode: string, vpnr: string): Promise<YukatelOrdersResponse> {
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