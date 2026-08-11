export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  color: string;
  images?: string[];
  description: string;
  specs: Record<string, string>;
};
