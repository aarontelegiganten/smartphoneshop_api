export interface Product {
  id: string;
  quantity: string;
}

export interface Prestashop {
  address: {
    id: string;
  };
  products: Product[];
}
