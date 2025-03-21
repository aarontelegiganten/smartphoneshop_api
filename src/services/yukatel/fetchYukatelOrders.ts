import axios from 'axios';
import dotenv from 'dotenv';
import { PaginatedResponse, YukatelOrder } from '@/models/YukatelOrders';
dotenv.config();




async function getYukatelOrders(apiUrl: string, initialPage = 1): Promise<YukatelOrder[]> {
  let allOrders: YukatelOrder[] = [];
  let currentPage = initialPage;
  let totalPages = 1;

  // Loop through all pages
  while (currentPage <= totalPages) {
    try {
      // Make the request to fetch orders
      const response = await axios.post<PaginatedResponse>(apiUrl, {
        data: [
          {
            order_id: 0,
            date_placed: 'string',
            invoice: 0,
            processed: true,
            editable: true,
          }
        ],
        current_page: currentPage,
        first_page_url: "string",
        from: 0,
        last_page: 0,
        last_page_url: "string",
        next_page_url: "string",
        path: "string",
        per_page: 0,
        prev_page_url: "string",
        to: 0,
        total: 0
      });

      // Append the current page's orders to the allOrders array
      allOrders = [...allOrders, ...response.data.data];

      // Update currentPage and totalPages based on the response
      currentPage = response.data.current_page + 1;
      totalPages = response.data.last_page;
      
      console.log(`Fetching page ${currentPage} of ${totalPages}`);
    } catch (error) {
      console.error('Error fetching orders:', error);
      break;
    }
  }

  return allOrders;
}

// Example usage
const apiUrl = 'https://yourapi.com/yukatel/orders'; // Replace with the correct URL
getYukatelOrders(apiUrl)
  .then(orders => {
    console.log('All Orders:', orders);
  })
  .catch(error => {
    console.error('Failed to retrieve orders:', error);
  });
