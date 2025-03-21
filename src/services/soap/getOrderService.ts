import * as soap from 'soap'; 
import OrderPayment  from '@/models/orderPayment';
import { withRetry } from '@/utils/withRetry';

interface SoapError {
    code: string;
    message: string;
    details?: unknown;
  }
  
  interface SoapHeader {
    sessionToken: string;
    uniqueRequest: string;
  }

function createSoapHeader(sessionToken: string): SoapHeader {
    return {
      sessionToken,
      uniqueRequest: Date.now().toString()
    };
  }
  
// Get an OrderPayment object by its ID via SOAP
export async function getOrderPayment(client: soap.Client, sessionToken: string, paymentId: number): Promise<OrderPayment | null> {
    try {
      // Step 1: Create and add the SOAP header with the session token
      const soapHeader = createSoapHeader(sessionToken);
      client.addSoapHeader(soapHeader);
  
      // Step 2: Set fields for the OrderPayment request (Adjust fields as needed)
      await withRetry(async () => {
        await new Promise<void>((resolve, reject) => {
          client.Order_SetFields({
            Fields: 'Id,OrderId,PaymentMethodId,Price,Title,Vat' // You can adjust these fields as needed
          }, (err: unknown) => {
            if (err) reject(new Error(`Error setting order payment fields: ${err}`));
            resolve();
          });
        });
      });
  
      // Step 3: Fetch the OrderPayment by PaymentId using retry logic
      return await withRetry(async () => {
        return new Promise<OrderPayment | null>((resolve, reject) => {
          // Call the SOAP service to fetch the OrderPayment
          client.Order_GetPayment({ PaymentId: paymentId }, (err: unknown, response: unknown) => {
            if (err) {
              reject(new Error(`Error fetching order payment: ${err}`));
            } else {
              // Assuming the response structure includes 'OrderPayment' directly
              const orderPayment = response ? (response as any).OrderPayment : null;
              if (orderPayment) {
                resolve(orderPayment);  // Return the OrderPayment object
              } else {
                console.error('No payment found for the given ID');
                resolve(null); // No payment found
              }
            }
          });
        });
      });
    } catch (error) {
      console.error('Error fetching OrderPayment via SOAP:', error);
      return null;  // Return null in case of error
    }
  }
  