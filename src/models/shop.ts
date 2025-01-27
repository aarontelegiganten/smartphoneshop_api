import type MobileAddsProduct from './mobileaddsproduct';

export interface Product extends MobileAddsProduct {
  id: string;
  quantity: string;
}

export interface Prestashop {
  address: {
    id: string;
  };
  products: Product[];
}
