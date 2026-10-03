export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

export type Collection = Category; // same shape

export type ProductVariant = {
  id: string;
  product_id: string;
  sku: string | null;
  colour: string | null;
  size: string | null;
  price: number | null;
  stock: number;
  image_url: string | null;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  full_description: string | null;
  category_id: string | null;
  collection_id: string | null;
  price: number;
  mrp: number;
  fabric: string | null;
  length: string | null;
  style: string | null;
  care_instructions: string | null;
  tags: string[];
  video_url: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

export type ProductWithRelations = Product & {
  variants: ProductVariant[];
  images: ProductImage[];
};
