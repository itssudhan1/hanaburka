import ProductForm from "@/components/admin/ProductForm";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from("categories").select("id, name"),
    supabase.from("collections").select("id, name"),
  ]);

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Add Product</h1>
      <ProductForm
        mode="create"
        categories={categories ?? []}
        collections={collections ?? []}
      />
    </div>
  );
}
