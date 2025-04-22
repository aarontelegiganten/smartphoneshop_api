// __mocks__/yukatelOrder.mock.ts
import { YukatelOrderResponse } from "../models/YukatelOrderResponse";

export const mockYukatelOrder: YukatelOrderResponse = {
  order_id: "858924",
  customer_reference: "21904",
  address_id: 0,
  status: "submitted",
  date_placed: "2025-04-22 14:24:15",
  date_processed: "0000-00-00 00:00:00",
  editable: true,
  items: [
    {
      order_id: 858924,
      artnr: "194252721384",
      description: "Apple AirPods Pro with MagSafe Charging Case - White",
      processed: false,
      credited: false,
      date_placed: "2025-04-22 14:24:15",
      planed_shipment: "0000-00-00 00:00:00",
      price: 157,
      tax: 0,
      quantity: 1,
      max_quantity: 100,
      date_processed: "0000-00-00 00:00:00",
      paid: "0000-00-00 00:00:00",
      is_shipping: false,
      is_transport_insurance: false,
      reward_points: 10,
      csell: 0
    }
  ],
  totals: {
    sub_total: 157,
    shipping_charge: 11.57,
    insurance_charge: 0.63,
    tax_total: 0,
    shippingMethod: "UPS Standard",
    total: 169.2,
    total_quantity: 1
  },
  shippingAddress: {
    name: "EU Trading 2015 ApS",
    salutation: "Firma",
    street: "Taastrup Hovedgade 92 1",
    country: "Dänemark",
    city: "Taastrup",
    postal: "DK-2630"
  }
};
