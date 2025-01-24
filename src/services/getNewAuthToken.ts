import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const clientSecret = process.env.CLIENT_SECRET;
const clientId = process.env.CLIENT_ID;

async function getNewAuthToken(): Promise<any> {
  const data = JSON.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: '',
  });

  const response = await axios.post(`https://shop99794.mywebshop.io/auth/oauth/token`, data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  // console.log('this is the response:', response.data);
  return response.data.access_token;
}

export default getNewAuthToken;
