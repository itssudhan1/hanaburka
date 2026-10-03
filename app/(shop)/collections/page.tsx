import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaggerGroup from "@/components/motion/StaggerGroup";
import CollectionTile from "@/components/CollectionTile";
import { createClient } from "@/lib/supabase/server";

export default async function CollectionsPage() {
  const supabase = createClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, image_url")
    .eq("is_published", true)
    .order("sort_order");

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl mb-8">Collections</h1>

        {!collections || collections.length === 0 ? (
          <p className="text-charcoal/60">No collections published yet.</p>
        ) : (
          <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {collections.map((c) => (
              <CollectionTile key={c.id} collection={c} />
            ))}
          </StaggerGroup>
        )}
      </div>
      <Footer />
    </>
  );
}
