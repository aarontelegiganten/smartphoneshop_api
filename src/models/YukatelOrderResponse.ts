export interface YukatelOrderItem {
    order_id: number;
    artnr: string;
    description: string;
    processed: boolean;
    credited: boolean;
    date_placed: string;
    planed_shipment: string;
    price: number;
    tax: number;
    quantity: number;
    max_quantity: number;
    date_processed: string;
    paid: string;
    is_shipping: boolean;
    is_transport_insurance: boolean;
    reward_points: number | null;
    csell: number;
  }
  
  export interface YukatelOrderTotals {
    sub_total: number;
    shipping_charge: number;
    insurance_charge: number;
    tax_total: number;
    shippingMethod: string;
    total: number;
    total_quantity: number;
  }
  
  export interface YukatelShippingAddress {
    name: string;
    salutation: string;
    street: string;
    country: string;
    city: string;
    postal: string;
  }
  
  export interface YukatelOrderResponse {
    order_id: string;
    customer_reference: string;
    address_id: number;
    status: string;
    date_placed: string;
    date_processed: string;
    editable: boolean;
    items: YukatelOrderItem[];
    totals: YukatelOrderTotals;
    shippingAddress: YukatelShippingAddress;
  }
  