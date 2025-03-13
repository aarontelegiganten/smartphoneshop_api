import axios from "axios";
import { CreateOrderRequest } from "@/models/YukatelOrderCreate";


export interface YukatelResponse {
    status: boolean;
    msg: string;
}

export async function createOrder(
    authcode: string,
    vpnr: number,
    orderData: CreateOrderRequest
): Promise<YukatelResponse> {
    const apiUrl = "/order/create"; // Replace with the actual API base URL if needed

    try {
        const response = await axios.post<YukatelResponse>(apiUrl, orderData, {
            params: { authcode, vpnr },
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error: any) {
        return {
            status: false,
            msg: error.response?.data?.msg || "Internal Server Error",
        };
    }
}

// // Example usage:
// const orderRequest: CreateOrderRequest = {
//     items: [{ article_number: 123456, requested_stock: 2 }],
//     customer_address_id: 987654,
//     customer_reference: "REF12345",
// };

// createOrder("your_auth_code", 1234, orderRequest)
//     .then((response) => console.log("Order Response:", response))
//     .catch((error) => console.error("Error creating order:", error));
