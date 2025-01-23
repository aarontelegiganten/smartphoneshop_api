interface Order {
  id: number;
}

class OrderModel {
  order: Order[] = [];

  getOrder(): Order[] {
    return this.order;
  }
}

const orderModel = new OrderModel();

export default orderModel;
