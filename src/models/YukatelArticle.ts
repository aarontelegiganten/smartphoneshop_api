interface YukatelArticle {
    articelno: string;
    description: string;
    quantity: number;
    sellingprice: number;
    yukapoints: number;
    next_delivery_amount: number;
    next_delivery_date: string;
    image: string;
    manufacturer: string;
    ean: number;
    part_number: string;
    category: string;
    is_new_product: boolean;
}
export default YukatelArticle;