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

export interface Address {
  id: string;
  href: string;
}
