export type Category = {
  $id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
};

export type Product = {
  $id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  mrp?: number;
  stock: number;
  images: string[];
  specs?: Record<string, string> | string;
  featured?: boolean;
  published?: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  imageAlt?: string;
  $createdAt?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  quantity: number;
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type ShippingAddress = {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
};

export type Order = {
  $id?: string;
  userId: string;
  items: string; // JSON-stringified CartItem[]
  total: number;
  status: OrderStatus;
  shippingAddress: string; // JSON-stringified ShippingAddress
  paymentMethod?: string;
  $createdAt?: string;
};
