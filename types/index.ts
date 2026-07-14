export interface Spec {
  id?: string;
  chave: string;
  valor: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  promotional_price?: number;
  highlight?: string;
  is_in_stock: boolean;
  stock_quantity?: number;
  sku?: string;
  organization_id: string;
  category_id?: string;
  specs?: Spec[];
  custom?: Record<string, string>;
  images?: string[];
  sort_order?: number;
  is_hidden?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  sort_order: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan_id?: string;
  business_model?: 'B2B' | 'B2C' | 'BOTH';
}
