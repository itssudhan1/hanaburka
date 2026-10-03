import ProductCard from "@/components/product/ProductCard";
import StaggerGroup from "@/components/motion/StaggerGroup";
import Reveal from "@/components/motion/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import { createClient } from "@/lib/supabase/server";

export default async function ProductRail({
  title,
  filterColumn,
  viewAllHref,
}: {
  title: string;
  filterColumn: "is_featured" | "is_bestseller" | "is_new_arrival";
  viewAllHref: string;
}) {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, name, price, mrp, product_images(url, is_primary, sort_order)")
    .eq("is_published", true)
    .eq(filterColumn, true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-12 sm:py-16">
      <Reveal>
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="text-3xl"><TextReveal as="span">{title}</TextReveal></h2>
          <a href={viewAllHref} className="text-sm text-mocha underline">
            View all
          </a>
        </div>
      </Reveal>
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-x-2.5 gap-y-8 sm:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </StaggerGroup>
    </section>
  );
}
