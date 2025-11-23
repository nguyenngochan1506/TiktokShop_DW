export interface SourceConfig {
  id: number;
  source_name: string;
  base_url: string;
  is_active: boolean;
  last_crawl_status: "SUCCESS" | "FAILED" | "PENDING" | null;
  last_crawl_timestamp: string | null;
}

export interface CrawlLog {
  id: number;
  source_config_id: number;
  file_name: string;
  file_path: string;
  record_count: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  error_message?: string;
  created_at: string;
}

export interface BaseProduct {
  id: string;
  product_id: string;
  title: string;
  price_sale: number;
  sold_count: number;
  seller_id: string;
  load_timestamp: string;
}