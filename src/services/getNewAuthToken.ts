import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getNewAuthToken(): Promise<any> {
  const response = await axios.post('https://shop99794.mywebshop.io/auth/oauth/token', null, {
    params: {
      grant_type: 'client_credentials',
      client_id: '3',
      client_secret: process.env.CLIENT_SECRET,
      scope: '',
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  console.log(response.data);
  return response.data;
}

export default getNewAuthToken;
