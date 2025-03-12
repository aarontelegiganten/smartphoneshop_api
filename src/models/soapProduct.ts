export interface ProductGetByIdResponse {
  // Define the structure returned by the SOAP API (this is a simplified version for demonstration)
  BuyingPrice?: number;
  CallForPrice?: boolean;
  CategoryId?: number;
  Category?: Category;  // Adjust this depending on the structure of `Category` in the response
  DateCreated?: string;
  DateUpdated?: string;
  DeliveryId?: number;
  DeliveryTimeId?: number;
  Description?: string;
  DescriptionLong?: string;
  DescriptionShort?: string;
  DisableOnEmpty?: boolean;
  Discount?: number;
  DiscountGroupId?: number;
  DiscountType?: string;
  Ean?: string;
  FocusCart?: boolean;
  FocusFrontpage?: boolean;
  GuidelinePrice?: number;
  Id: number;
  ItemNumber?: string;
  ItemNumberSupplier?: string;
  LanguageISO?: string;
  MinAmount?: number;
  Online?: boolean;
  Price?: number;
  ProducerId?: number;
  ProductUrl?: string;
  RelatedProductIds?: number[];
  RelationCode?: string;
  SeoCanonical?: string;
  SeoDescription?: string;
  SeoKeywords?: string;
  SeoLink?: string;
  SeoTitle?: string;
  Sorting?: number;
  Status?: boolean;
  Stock?: number;
  StockLow?: number;
  Title?: string;
  Type?: any;  // Could be refined if more details are known
  UnitId?: number;
  Url?: string;
  VatGroupId?: number;
  Weight?: number;
  VariantTypes?:string;
}


export interface Product {
    Additionals?: ProductAdditionalType[];
    AutoStock?: AutoStock;
    BuyingPrice: number;
    CallForPrice: boolean;
    Category?: Category;
    CategoryId: number;
    CategorySortings?: ProductCategorySorting[];
    CustomData?: ProductCustomData[];
    DateCreated: string;
    DateUpdated: string;
    Delivery?: Delivery;
    DeliveryId: number;
    DeliveryTime?: ProductDeliveryTime;
    DeliveryTimeId: number;
    Description: string;
    DescriptionLong: string;
    DescriptionShort: string;
    DisableOnEmpty: boolean;
    Discount: number;
    DiscountGroup?: DiscountGroup;
    DiscountGroupId: number;
    Discounts?: ProductDiscount[];
    DiscountType: string;
    Ean: string;
    ExtraBuyRelations?: ProductExtraBuyRelation[];
    FocusCart: boolean;
    FocusFrontpage: boolean;
    GuidelinePrice: number;
    Id: number;
    ItemNumber: string;
    ItemNumberSupplier: string;
    LanguageAccess?: string[];
    LanguageISO: string;
    MinAmount: number;
    Online: boolean;
    OutOfStockBuy?: OutOfStockBuy;
    PacketProducts?: PacketProductLine[];
    Pictures?: ProductPicture[];
    Price: number;
    Producer?: User;
    ProducerId: number;
    ProductUrl: string;
    RelatedProductIds?: number[];
    RelationCode: string;
    SecondaryCategories?: Category[];
    SecondaryCategoryIds?: number[];
    SeoCanonical: string;
    SeoDescription: string;
    SeoKeywords: string;
    SeoLink: string;
    SeoTitle: string;
    Sorting: number;
    Status: boolean;
    Stock: number;
    StockLocationId?: VatGroup;
    StockLow: number;
    StockLocations?: ProductStockLocation[];
    Tags?: ProductTag[];
    Title: string;
    Type: any; // Could be refined if more details are known
    Unit?: ProductUnit;
    UnitId: number;
    Url: string;
    UserAccess?: User[];
    UserAccessIds?: number[];
    UserGroupAccess?: UserGroup[];
    UserGroupAccessIds?: number[];
    Variants?: ProductVariant[];
    VariantTypes: string;
    VatGroup?: VatGroup;
    VatGroupId: number;
    Weight: number;
  }
  
  // Define other interfaces for nested objects
  interface ProductAdditionalType {
    // Define fields based on the API response
  }
  
  interface AutoStock {
    // Define fields based on the API response
  }
  
  interface Category {
    Id: number;
    Name: string;
  }
  
  interface ProductCategorySorting {
    // Define fields based on the API response
  }
  
  interface ProductCustomData {
    // Define fields based on the API response
  }
  
  interface Delivery {
    Id: number;
    Name: string;
  }
  
  interface ProductDeliveryTime {
    Id: number;
    Time: string;
  }
  
  interface DiscountGroup {
    Id: number;
    Name: string;
  }
  
  interface ProductDiscount {
    // Define fields based on the API response
  }
  
  interface ProductExtraBuyRelation {
    // Define fields based on the API response
  }
  
  interface OutOfStockBuy {
    // Define fields based on the API response
  }
  
  interface PacketProductLine {
    // Define fields based on the API response
  }
  
  interface ProductPicture {
    Url: string;
    AltText: string;
  }
  
  interface User {
    Id: number;
    Name: string;
  }
  
  interface VatGroup {
    Id: number;
    Name: string;
  }
  
  interface ProductStockLocation {
    // Define fields based on the API response
  }
  
  interface ProductTag {
    Name: string;
  }
  
  interface ProductUnit {
    Id: number;
    Name: string;
  }
  
  interface UserGroup {
    Id: number;
    Name: string;
  }
  
  interface ProductVariant {
    // Define fields based on the API response
  }
  