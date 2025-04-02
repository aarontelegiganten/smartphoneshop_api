export interface MailchimpProductImage {
  id: string;
  url: string; // <<< CORRECT FIELD NAME for items in the images array
  variant_ids?: string[];
}
export interface MailchimpProductVariant {
  id: string;                      // Unique identifier for the variant
  title: string;                   // Title of the product variant (e.g., "Red", "32GB")
  sku: string;                     // Stock Keeping Unit (SKU) for the variant
  price: number;                   // Price of the product variant
  inventory_quantity: number;      // Inventory quantity of this variant
  backorders?: string;             // Backorder status for this variant (optional)
  visibility?: string;             // Visibility status of this variant (optional)
}

export interface MailchimpProduct {
  id: string;                      // Unique identifier for the product (in Mailchimp)
  title: string;                   // The title of the product
  description: string;             // The description of the product
  image_url: string;               // Image URL for the product
  images: MailchimpProductImage[]; // Array of product images
  variants: MailchimpProductVariant[];  // Array of product variants (at least one variant is required)
  url?: string;                    // Optional URL for the product (can be the URL of the main product page)
}


