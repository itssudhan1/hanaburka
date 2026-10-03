import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, is_published, is_featured, category:categories(name), product_variants(stock)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-espresso">Products</h1>
        <Link href="/admin/products/new" className="bg-espresso text-ivory px-4 py-2 text-sm">
          + Add Product
        </Link>
      </div>

      <div className="border border-mocha/15 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Published</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p: any) => {
              const totalStock = (p.product_variants ?? []).reduce(
                (s: number, v: any) => s + v.stock, 0
              );
              return (
                <tr key={p.id} className="border-b border-mocha/10">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category?.name ?? "—"}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3">{totalStock}</td>
                  <td className="p-3">{p.is_published ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-espresso underline">
                        Edit
                      </Link>
                      <DeleteProductButton productId={p.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!products || products.length === 0) && (
              <tr><td colSpan={6} className="p-5 text-charcoal/50">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
