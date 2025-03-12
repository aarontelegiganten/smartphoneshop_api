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

export interface YukatelResponse {
    status: number;
    message: string;
}
