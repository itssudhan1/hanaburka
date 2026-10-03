import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopFilters from "@/components/shop/ShopFilters";
import ProductCard from "@/components/product/ProductCard";
import StaggerGroup from "@/components/motion/StaggerGroup";
import Reveal from "@/components/motion/Reveal";
import { getProducts, type ShopFilters as Filters } from "@/lib/queries/products";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}): Promise<Metadata> {
  if (searchParams.category) {
    return { title: `${searchParams.category.replace(/-/g, " ")} | HANA BURKA` };
  }
  if (searchParams.collection) {
    return { title: `${searchParams.collection.replace(/-/g, " ")} | HANA BURKA` };
  }
  return {
    title: "Shop | HANA BURKA",
    description: "Shop burkas, abayas, hijabs, and modest fashion essentials at HANA BURKA.",
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const supabase = createClient();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from("categories").select("name, slug").eq("is_published", true),
    supabase.from("collections").select("name, slug").eq("is_published", true),
  ]);

  const filters: Filters = {
    category: searchParams.category || undefined,
    collection: searchParams.collection || undefined,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    colour: searchParams.colour || undefined,
    size: searchParams.size || undefined,
    inStockOnly: searchParams.inStockOnly === "true",
    sort: (searchParams.sort as Filters["sort"]) || "newest",
    q: searchParams.q || undefined,
  };

  const products = await getProducts(filters);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-10">
          {/* Filters - Mobile collapsible, Desktop fixed width */}
          <div className="md:sticky md:top-4 md:h-fit">
            <ShopFilters
              categories={(categories ?? []).map((c) => ({ label: c.name, value: c.slug }))}
              collections={(collections ?? []).map((c) => ({ label: c.name, value: c.slug }))}
              current={searchParams}
            />
          </div>

          {/* Products Grid */}
          <div>
            <h1 className="text-2xl md:text-3xl mb-6 md:mb-8 font-display">
              {filters.q ? `Results for "${filters.q}"` : "Shop"}
            </h1>

            {products.length === 0 ? (
              <Reveal>
                <div className="py-16 md:py-24 text-center text-charcoal/60">
                  <p className="mb-2 text-base md:text-lg">No products found.</p>
                  <p className="text-sm md:text-base">
                    Try adjusting your filters, or check back soon — new pieces
                    are added regularly.
                  </p>
                </div>
              </Reveal>
            ) : (
              <StaggerGroup className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </StaggerGroup>
            )}
          </div>
        </div>

        {/* Spacer for mobile sticky filter button */}
        <div className="h-20 md:h-0"></div>
      </div>
      <Footer />
    </>
  );
}
