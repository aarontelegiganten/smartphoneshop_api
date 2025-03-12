import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const clientSecret = process.env.CLIENT_SECRET;
const clientId = process.env.CLIENT_ID;
const url = process.env.WEBSHOP_AUTH_TOKEN_URL;

async function getNewAuthToken(): Promise<any> {
  const data = JSON.stringify({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: '',
  });
  if (url !== undefined) {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // console.log('this is the response:', response.data);
    return response.data.access_token;
  }
}

export default getNewAuthToken;
