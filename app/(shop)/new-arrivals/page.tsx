import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";

export default async function NewArrivalsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, price, mrp, product_images(url, is_primary)")
    .eq("is_published", true)
    .eq("is_new_arrival", true)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl mb-8">New Arrivals</h1>

        {!products || products.length === 0 ? (
          <div className="py-16 text-center text-charcoal/60">
            <p>Nothing marked as a new arrival yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
