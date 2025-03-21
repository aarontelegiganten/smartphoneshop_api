// yukatelOrder.model.ts

export interface YukatelOrder {
    order_id: number;
    date_placed: string;
    invoice: number;
    processed: boolean;
    editable: boolean;
  }
  
  export interface PaginatedResponse {
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
  
  export interface RequestBody {
    data: Array<{
      order_id: number;
      date_placed: string;
      invoice: number;
      processed: boolean;
      editable: boolean;
    }>;
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
  }
  