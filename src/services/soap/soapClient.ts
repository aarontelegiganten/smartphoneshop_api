import * as soap from 'soap';


const WSDL_URL = 'https://api.hostedshop.io/service.wsdl' 
const options = {
    wsdl_options: {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  };
export async function createSoapClient(): Promise<soap.Client> {
    return new Promise((resolve, reject) => {
        soap.createClient(WSDL_URL, options, (err, client) => {
            if (err) return reject(err);
            resolve(client);
        });        
    });
}

export async function authenticate(client: soap.Client, username: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {

        client.Solution_Connect(
            { Username: username, Password: password },
            (err: any, response: any, rawResponse: any, soapHeaders: any, httpResponse: any) => {
                if (err) {
                    // If there's an error during authentication, reject the promise
                    return reject('❌ Authentication failed: ' + err);
                }

                // Log the raw response for debugging purposes
                // console.log('📡 Raw Authentication Response:', rawResponse);
                // console.log('🔍 Parsed Response:', response);

                // Extract session cookie from HTTP response headers
                const cookieHeader = client.lastResponseHeaders?.['set-cookie'];

                if (cookieHeader && cookieHeader.length > 0) {
                    // Extract the actual cookie value (the first cookie from the header)
                    const sessionCookie = cookieHeader[0].split(';')[0]; // Extract 'JSESSIONID=abc123'

                    // Add the session cookie to the SOAP client for future requests
                    client.addHttpHeader('Cookie', sessionCookie);

                    // Log success and return the session token
                    // console.log('✅ Authentication successful! Session Cookie Set:', sessionCookie);
                    resolve(sessionCookie);
                } else {
                    // If no session cookie was received, reject with an error
                    reject('❌ Authentication failed: No session cookie received.');
                }
            }
        );        
    });
}

export async function setLanguage(client: soap.Client, languageISO: string): Promise<void> {
    return new Promise((resolve, reject) => {
      client.Solution_SetLanguage({ LanguageISO: languageISO }, (err: any, response: any) => {
        if (err) {
          return reject('Error setting language: ' + err);
        }
        // console.log(`✅ Language set to ${languageISO}`);
        resolve();
      });
    });
  }