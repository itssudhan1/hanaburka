import Reveal from "@/components/motion/Reveal";
import TextReveal from "@/components/motion/TextReveal";
import CategoryTile from "@/components/CategoryTile";
import { createClient } from "@/lib/supabase/server";

export default async function CategoryGrid() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .eq("is_published", true)
    .order("sort_order");

  if (!categories?.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <Reveal>
        <h2 className="text-3xl mb-10"><TextReveal as="span">Shop by Category</TextReveal></h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat) => (
            <CategoryTile key={cat.id} category={cat} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
