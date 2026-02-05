export interface Supplier {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  supplier_id?: number;
  category_id?: number;
  description?: string;
}
