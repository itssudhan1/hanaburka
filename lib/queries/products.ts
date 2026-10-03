import { createClient } from "@/lib/supabase/server";

export type ShopFilters = {
  category?: string; // category slug
  collection?: string; // collection slug
  minPrice?: number;
  maxPrice?: number;
  colour?: string;
  size?: string;
  fabric?: string;
  inStockOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "bestselling" | "featured";
  q?: string; // search term
};

/**
 * Fetches published products matching the given filters, each with its
 * primary image and variant list, sorted server-side. Pagination should be
 * added here (range()) once product volume warrants it.
 */
export async function getProducts(filters: ShopFilters) {
  const supabase = createClient();

  // Resolve slug filters to IDs first — filtering on an embedded resource's
  // column (e.g. `.eq('categories.slug', ...)`) filters the embedded rows,
  // not the parent product rows, so it wouldn't actually narrow the results.
  let categoryId: string | undefined;
  let collectionId: string | undefined;

  if (filters.category) {
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    categoryId = data?.id;
  }
  if (filters.collection) {
    const { data } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", filters.collection)
      .single();
    collectionId = data?.id;
  }

  let query = supabase
    .from("products")
    .select(
      `id, name, slug, price, mrp, fabric, is_featured, is_bestseller, is_new_arrival,
       category:categories(slug, name),
       collection:collections(slug, name),
       product_images(url, is_primary, sort_order),
       product_variants(id, colour, size, stock)`
    )
    .eq("is_published", true);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (collectionId) query = query.eq("collection_id", collectionId);
  if (filters.minPrice != null) {
    query = query.gte("price", filters.minPrice);
  }
  if (filters.maxPrice != null) {
    query = query.lte("price", filters.maxPrice);
  }
  if (filters.fabric) {
    query = query.eq("fabric", filters.fabric);
  }
  if (filters.q) {
    query = query.ilike("name", `%${filters.q}%`);
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "bestselling":
      query = query.order("is_bestseller", { ascending: false });
      break;
    case "featured":
      query = query.order("is_featured", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  let products = data ?? [];

  // Colour/size/availability filter at the variant level, applied after
  // fetch since these need to check "does ANY variant match" per product.
  if (filters.colour) {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.colour === filters.colour)
    );
  }
  if (filters.size) {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.size === filters.size)
    );
  }
  if (filters.inStockOnly) {
    products = products.filter((p: any) =>
      p.product_variants?.some((v: any) => v.stock > 0)
    );
  }

  return products;
}

export async function getProductBySlug(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `*,
       category:categories(name, slug),
       collection:collections(name, slug),
       product_variants(*),
       product_images(*)`
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}

export async function getApprovedReviews(productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, title, body, images, created_at")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string) {
  if (!categoryId) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, mrp, product_images(url, is_primary)")
    .eq("category_id", categoryId)
    .eq("is_published", true)
    .neq("id", excludeId)
    .limit(4);
  return data ?? [];
}
