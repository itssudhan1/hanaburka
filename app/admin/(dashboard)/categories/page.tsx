import CategoryManager from "@/components/admin/CategoryManager";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Categories</h1>
      <CategoryManager categories={categories ?? []} />
    </div>
  );
}
