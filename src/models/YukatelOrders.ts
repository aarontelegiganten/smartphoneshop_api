// Model for a single order
interface YukatelOrder {
    order_id: number;
    date_placed: string;
    invoice: number;
    processed: boolean;
    editable: boolean;
  }
  
  // Model for the full API response
  export interface YukatelOrdersResponse {
    data: YukatelOrder[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  }
  