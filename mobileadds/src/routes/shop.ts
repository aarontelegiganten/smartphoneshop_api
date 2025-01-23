import axios from 'axios';
import dotenv from 'dotenv';
// Define the GraphQL query or mutation
const query = `
  query {
  orderById(
    id:9561
  ) {
      id
  }
}
`;

// Define TypeScript interfaces for the response data
interface Order {
  data: {
    orderById: {
      id: string;
    };
  };
}

dotenv.config();
const token = process.env.TOKEN;

// Function to call the GraphQL API
async function fetchOrders(): Promise<Order | undefined> {
  try {
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
    const order: Order = response.data;
    console.log(response.data);
    return order;
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

export default fetchOrders;
