export interface URL {
  id: string;
  short_id: string;
  original_url: string;
  clicks: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClickAnalytics {
  id?: string;
  url_id: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  created_at: string;
}

export interface URLAnalytics {
  total_clicks: number;
  unique_clicks: number;
  clicks_by_date: Array<{
    date: string;
    count: number;
  }>;
  top_countries: Array<{
    country: string;
    count: number;
  }>;
}
