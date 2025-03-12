interface OrderItem {
    article_number: number;
    requested_stock: number;
}

export interface CreateOrderRequest {
    items: OrderItem[];
    customer_address_id: number;
    customer_reference: string;
}

// Example usage:
// const orderRequest: CreateOrderRequest = {
//     items: [
//         {
//             article_number: 123456,
//             requested_stock: 2
//         }
//     ],
//     customer_address_id: 987654,
//     customer_reference: "REF12345"
// };

// console.log(orderRequest);
