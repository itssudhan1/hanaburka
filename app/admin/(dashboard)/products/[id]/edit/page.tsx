import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import ProductImageManager from "@/components/admin/ProductImageManager";
import VariantManager from "@/components/admin/VariantManager";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createAdminClient();
  const [{ data: product }, { data: categories }, { data: collections }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_variants(*), product_images(*)")
      .eq("id", params.id)
      .single(),
    supabase.from("categories").select("id, name"),
    supabase.from("collections").select("id, name"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Edit Product</h1>

      <div className="mb-10">
        <h2 className="text-lg text-espresso mb-3">Images</h2>
        <ProductImageManager productId={product.id} images={product.product_images ?? []} />
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        initial={product}
        categories={categories ?? []}
        collections={collections ?? []}
      />

      <div className="mt-10">
        <h2 className="text-lg text-espresso mb-3">Variants &amp; Stock</h2>
        <VariantManager productId={product.id} variants={product.product_variants ?? []} />
      </div>
    </div>
  );
}
