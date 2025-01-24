interface Product {
  name: string;
  description: string;
}

class ProductsModel {
  products: Product[];

  constructor() {
    this.products = [
      { name: 'RulerChen', description: 'Author of this project' },
      { name: 'joshtu0627', description: 'Author of this project' },
    ];
  }

  getProducts(): Product[] {
    return this.products;
  }
}

const productsModel = new ProductsModel();

export default productsModel;
