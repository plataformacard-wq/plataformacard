import { Product, Spec } from "../types";

export interface CartItem {
  id: string; // Unique key: product.id + selected color/spec
  product: Product;
  quantity: number;
  selectedColor?: string | null;
  selectedSpec?: Spec | null;
  unitPrice: number;
  notes?: string;
}

export interface CheckoutData {
  customerName: string;
  deliveryMethod: "retirada" | "entrega";
  address?: string;
  paymentMethod: string;
  notes?: string;
}
