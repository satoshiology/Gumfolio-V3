export interface Product {
  id: string;
  name: string;
  price: number; // Base price in cents
  currency: string;
  short_url: string;
  thumbnail_url: string | null;
  sales_count: number;
  sales_usd_cents: number;
  published: boolean;
  description?: string | null;
  file_type?: string;
  file_size?: string;
  license?: string;
  customizable_price?: number | null;
  is_pay_what_you_want?: boolean;
  variants?: any[];
  is_tiered_membership?: boolean;
  recurrences?: string[] | null;
}

export interface Sale {
  id: string;
  email: string;
  product_name: string;
  price: number;
  currency_symbol: string;
  created_at: string;
  product_id: string;
  partially_refunded: boolean;
  refunded: boolean;
  is_product_physical?: boolean;
  shipped?: boolean;
  tracking_url?: string | null;
  license_key?: string;
  license_disabled?: boolean;
}

export interface LicenseVerificationResponse {
  success: boolean;
  uses: number;
  purchase: {
    email: string;
    created_at: string;
    id: string;
    refunded: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  profile_picture_url: string;
  url: string;
}

export interface Payout {
  id: string | null;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  processed_at: string | null;
  payment_processor: string;
}
