import axios from 'axios';
import type Order from '../models/order';
import getNewAuthToken from '@/services/getNewAuthToken';

// Define the GraphQL query or mutation
const query = `
  query {
  orderById(
    id:9561
  ) {
      id
      createdAt
      comments {internal external}
      orderLines {productId productTitle variantId variantTitle supplierNumber articleNumber}
  }
}
`;

// Function to call the GraphQL API
async function fetchOrder(): Promise<Order | undefined> {
  try {
    const token = await getNewAuthToken();
    if (token !== null && token !== undefined) {
      // Make a POST request to the API
      const response = await axios.post<Order>(
        'https://shop99794.mywebshop.io/api/graphql',
        {
          query,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // if authentication is needed
          },
        },
      );

      // Handle the response data
      // const order: Order = response.data;
      // console.log(response.data.data.orderById.orderLines[0].articleNumber);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

export default fetchOrder;
