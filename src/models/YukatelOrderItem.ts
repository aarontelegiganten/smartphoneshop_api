export default interface YukatelOrderItem {
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
    date_processed: string;
    paid: string;
    is_shipping: boolean;
}

export interface YukatelOrder {
    items: YukatelOrderItem[];
}

export interface YukatelError {
    code: string;
    message: string;
    artnr: number;
  }
  
  export interface YukatelResponse {
    status: boolean;
    msg: string;
    order_id?: number; // Present only if status is true
    errors?: YukatelError[]; // Present only if status is false
  }
  
  