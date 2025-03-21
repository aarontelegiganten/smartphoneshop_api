export default interface OrderPayment {
    id: number;                // Payment ID
    paymentMethod: PaymentMethod;   // Payment method ID (could be a reference to a payment method type)
    price: number;             // Price of the payment
    vatRate: boolean;              // VAT included (true/false)
  }
  interface PaymentMethod {
    id: string; // ID of the payment method (string type as per the schema)
    translations: []; // Translations for the payment method
  }
  