import { Request, Response } from 'express';
// import { readCSV, transformProductData } from '../services/csv/csvService';
import { findProductInMailchimp, syncOrUpdateProductToMailchimp, syncAllProductsToMailchimp, deleteAllProducts, findProductsInMailchimp } from '../services/mailchimp/mailchimpService';

const CSV_FILE_PATH = 'static/test.csv';
const BASE_URL = 'https://smartphoneshop.dk';

// ✅ Process CSV and Sync All Products
// export async function processCSVController(req: Request, res: Response) {
//   try {
//     console.log('📂 Reading CSV file...');
//     const products = await readCSV(CSV_FILE_PATH);

//     for (const row of products) {
//       const productData = transformProductData(row, BASE_URL);
//       if (productData) await syncOrUpdateProductToMailchimp(productData);
//     }

//     console.log('✅ CSV processing complete.');
//     res.status(200).json({ message: 'Products synced to Mailchimp successfully!' });
//   } catch (error) {
//     console.error('❌ Processing error:', error);
//     res.status(500).json({ error: 'Failed to process CSV file' });
//   }
// }

// ✅ Update a Single Product
export async function updateProductController(req: Request, res: Response) {
  try {
    const productData = req.body;
    if (!productData.id) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    await syncOrUpdateProductToMailchimp(productData);
    res.status(200).json({ message: `✅ Product ${productData.id} updated or created.` });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}


export async function getOneProductController(req: Request, res: Response) {
  try {       
    const productId = req.params.id;
    console.log('📦 Product ID:', productId);
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const product = await findProductInMailchimp(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('❌ Error retrieving product:', error);                     
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
}

export async function getProductsController(req: Request, res: Response) {
  try {       

    const products = await findProductsInMailchimp();
    if (!products) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error retrieving products:', error);                     
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
}
// // ✅ Update Products from CSV 
// export async function updateProductsFromCSVController(req: Request, res: Response) {
//   try {
//     console.log('📂 Reading CSV file for updates...');
//     const products = await readCSV(CSV_FILE_PATH);

//     for (const row of products) {
//       const productData = transformProductData(row, BASE_URL);
//       if (productData) await syncOrUpdateProductToMailchimp(productData);
//     }

//     console.log('✅ Products updated from CSV.');
//     res.status(200).json({ message: 'Products updated successfully from CSV.' });
//   } catch (error) {
//     console.error('❌ Error updating products from CSV:', error);
//     res.status(500).json({ error: 'Failed to update products from CSV' });
//   }
// }

// // ✅ Delete All Products
export async function deleteProductsController(req: Request, res: Response) {
  try {
    await deleteAllProducts();
    console.log('✅ Product deletion completed.');
    res.status(200).json({ message: 'All products deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting products:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
}

export async function syncAllProductsToMailchimpController(req: Request, res: Response) {

  try {

    await syncAllProductsToMailchimp();

    // res.status(200).json({ message: 'All products synced to Mailchimp successfully' });
  } catch (error) {
    console.error('❌ Error syncing products to Mailchimp:', error);
    res.status(500).json({ error: 'Failed to sync products to Mailchimp' });
  }
}




