interface OrderLine {
  productId: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  supplierNumber: string;
  articleNumber: string;
  amount: string;
}
// Define TypeScript interfaces for the response data
export default interface Order {
  data: {
    orderById: {
      id: string;
      totalItems: string;
      createdAt: string;
      comments: Record<string, []>;
      orderLines: OrderLine[];
    };
  };
}
