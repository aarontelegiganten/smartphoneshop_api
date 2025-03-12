import * as soap from 'soap'; 
import { Product, ProductGetByIdResponse } from "@/models/soapProduct"; 
const uniqueValue = Date.now();
export async function fetchProductById(client: soap.Client, sessionToken: string, productId: number) {
  try {
    // Attach session token as a SOAP header
    const soapHeader = { 
      sessionToken: sessionToken,
      uniqueRequest: uniqueValue.toString()
    };
    client.addSoapHeader(soapHeader);

    // Set the product fields you want to retrieve
    await new Promise<void>((resolve, reject) => {
      client.Product_SetFields({ Fields: 'Id,ItemNumber,Status,Title,Discount,Price,Stock,Description,BuyingPrice,Pictures,Variants,DateCreated,DateUpdated,Url' }, (err: any, response: any) => {
        if (err) return reject('Error setting product fields: ' + err);
        console.log('Product fields set successfully:', response);
        resolve();
      });
    });

    // Set the variant fields you want to retrieve
    await new Promise<void>((resolve, reject) => {
      client.Product_SetVariantFields({ Fields: 'Id' }, (err: any, response: any) => {
        if (err) return reject('Error setting variant fields: ' + err);
        // console.log('Variant fields set successfully:', response); // Optional, if you want to log this
        resolve();
      });
    });

    // Ensure productId is an integer
    const productIdInt = Math.floor(productId);

    // Fetch the product by ID
    const productResponse = await new Promise<any>((resolve, reject) => {
      client.Product_GetById({ ProductId: productIdInt }, (err: any, response: any) => {
        if (err) return reject('Error fetching product: ' + err);
        // Log the full response to debug if necessary
        // console.log('Full Product Response:', JSON.stringify(response, null, 2));

        if (response && response.Product_GetByIdResult) {
          resolve(response.Product_GetByIdResult);
        } else {
          reject('❌ Failed to fetch product: No valid response field.');
        }
      });
    });

    // Return the product if found
    // console.log('✅ Product fetched:', productResponse);
    return productResponse;

  } catch (error) {
    // console.error('Error in fetchProductById:', error);
    throw error; // Rethrow or return the error, depending on your needs
  }
}





  // Map the SOAP response to the Product type
  function mapResponseToProduct(response: ProductGetByIdResponse): Product {
    return {
      BuyingPrice: response.BuyingPrice || 0,  // Provide defaults for optional fields
      CallForPrice: response.CallForPrice || false,
      CategoryId: response.CategoryId || 0,
      Category: response.Category || undefined,  // Assuming Category can be null or undefined
      DateCreated: response.DateCreated || '',
      DateUpdated: response.DateUpdated || '',
      DeliveryId: response.DeliveryId || 0,
      DeliveryTimeId: response.DeliveryTimeId || 0,
      Description: response.Description || '',
      DescriptionLong: response.DescriptionLong || '',
      DescriptionShort: response.DescriptionShort || '',
      DisableOnEmpty: response.DisableOnEmpty || false,
      Discount: response.Discount || 0,
      DiscountGroupId: response.DiscountGroupId || 0,
      DiscountType: response.DiscountType || '',
      Ean: response.Ean || '',
      FocusCart: response.FocusCart || false,
      FocusFrontpage: response.FocusFrontpage || false,
      GuidelinePrice: response.GuidelinePrice || 0,
      Id: response.Id,
      ItemNumber: response.ItemNumber || '',
      ItemNumberSupplier: response.ItemNumberSupplier || '',
      LanguageISO: response.LanguageISO || '',
      MinAmount: response.MinAmount || 1,  // Provide a default value for MinAmount
      Online: response.Online || false,
      Price: response.Price || 0,
      ProducerId: response.ProducerId || 0,
      ProductUrl: response.ProductUrl || '',
      RelatedProductIds: response.RelatedProductIds || [],
      RelationCode: response.RelationCode || '',
      SeoCanonical: response.SeoCanonical || '',
      SeoDescription: response.SeoDescription || '',
      SeoKeywords: response.SeoKeywords || '',
      SeoLink: response.SeoLink || '',
      SeoTitle: response.SeoTitle || '',
      Sorting: response.Sorting || 0,
      Status: response.Status || false,
      Stock: response.Stock || 0,
      StockLow: response.StockLow || 0,
      Title: response.Title || '',
      Type: response.Type || undefined,
      UnitId: response.UnitId || 0,
      Url: response.Url || '',
      VatGroupId: response.VatGroupId || 0,
      Weight: response.Weight || 0,
      VariantTypes: response.VariantTypes || ''
    };
  }