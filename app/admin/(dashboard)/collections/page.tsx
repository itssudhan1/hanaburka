import CollectionManager from "@/components/admin/CollectionManager";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCollectionsPage() {
  const supabase = createAdminClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, image_url")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Collections</h1>
      <CollectionManager collections={collections ?? []} />
    </div>
  );
}
