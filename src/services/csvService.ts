import fs from "fs";
import { parse } from "csv-parse";

// ✅ Helper function to parse prices correctly
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace(",", ".").replace(/[^0-9.]/g, "")) || 0;
}

// ✅ Read and parse CSV file
export function readCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const products: any[] = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          delimiter: ";",
          columns: (header) => header.map((h: string) => h.trim().toLowerCase()), // Normalize column names
          trim: true,
          skip_empty_lines: true,
        })
      )
      .on("data", (row) => {
        const normalizedRow = Object.keys(row).reduce((acc, key) => {
          acc[key.toLowerCase()] = row[key];
          return acc;
        }, {} as Record<string, any>);

        products.push(normalizedRow);
      })
      .on("end", () => {
        console.log(`✅ Parsed ${products.length} rows successfully.`);
        console.log("🔍 Sample row:", products[0]); // Debug first row
        resolve(products);
      })
      .on("error", (error: Error) => {
        console.error("❌ CSV Parsing Error:", error.message);
        reject(error);
      });
  });
}

// ✅ Transform CSV row into Mailchimp product format
export function transformProductData(row: any, baseUrl: string) {
  if (!row) {
    console.error("🚨 Invalid row data:", row);
    return null;
  }

  console.log("🔍 Raw row:", row);
  console.log("🛠 Available Columns:", Object.keys(row));

  const productId: string = row["product_id"]?.trim() || "";
  const productName: string = row["title_dk"]?.trim() || "Unnamed Product";
  const productUrl: string = `${baseUrl.replace(/\/$/, '')}/${(row["url"] || "").trim().replace(/^\/+/, '')}`;
  const productDescription: string = row["description"]?.trim() || "";
  const stockQuantity: number = parseInt(row["stock"], 10) || 0;
  const price: number = parsePrice(row["price"] || "0");
  const backorders: string = row["backorders"]?.trim() || "not_allowed"; // ✅ Handle backorders
  const visibility: string = row["visibility"]?.trim() || "visible"; // ✅ Handle visibility

  if (!productId) {
    console.error("❌ Missing product_id in row:", row);
    return null;
  }

  // ✅ Extract image URL correctly
  const imageUrl = getImageUrlFromCsv(row["pictures"] || row["image_url"] || "");
  console.log(`🖼️ Final Processed Image URL for ${productId}:`, imageUrl || "⚠️ EMPTY");

  return {
    id: productId,
    title: productName,
    url: productUrl, // ✅ Correctly mapped for Mailchimp
    description: productDescription,
    image_url: imageUrl,
    variants: [
      {
        id: `${productId}-default`,
        title: productName,
        sku: productId,
        price: price,
        inventory_quantity: stockQuantity,
        url: productUrl, // ✅ Ensures variant has a URL
        image_url: imageUrl, // ✅ Ensures variant has an image
        backorders: backorders, // ✅ Send backorders
        visibility: visibility, // ✅ Send visibility
      },
    ],
  };
}

// ✅ Extract and process image URLs correctly
const getImageUrlFromCsv = (imageField: string): string => {
  if (!imageField || imageField.length < 5) return "";

  const imagePaths = imageField.split("|"); // Split multiple images
  if (imagePaths.length === 0) return "";

  const firstImagePath = imagePaths[0].trim(); // Get the first image
  return fixImageUrl(firstImagePath); // Fix the URL using our function
};

// ✅ Fix incorrect image paths
const fixImageUrl = (imgPath: string): string => {
  if (!imgPath || imgPath.length < 5) return "";
  imgPath = imgPath.trim();

  if (imgPath.startsWith("http")) return imgPath; // Already a full URL

  // ✅ Handle paths dynamically
  const pathParts = imgPath.split("/");
  const brandFolder = pathParts.length > 1 ? pathParts[0] : "unknown"; // Fix brand extraction

  // ✅ Ensure no duplicate "pics/"
  const cleanedPath = imgPath.replace(/^(\.\.\/pics\/|\/|pics\/)/, "");

  // ✅ Construct final image URL
  const fixedUrl = `https://shop99794.sfstatic.io/upload_dir/pics/${cleanedPath}`;

  console.log(`🔗 Fixed Image URL: ${fixedUrl}`);
  return fixedUrl;
};
