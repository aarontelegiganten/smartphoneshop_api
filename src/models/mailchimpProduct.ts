export interface MailchimpProduct {
    id: string;                // The unique identifier for the product (string in Mailchimp)
    title: string;             // The title of the product
    price: string;             // The price of the product as a string (not a number)
    description: string;       // Product description
    images: string[];          // Optional, array of image URLs      // Optional, custom data for extended information
  }
  