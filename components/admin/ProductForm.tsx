"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions/products";

type VariantRow = {
  colour: string;
  size: string;
  sku: string;
  price: string;
  stock: string;
};

type Option = { id: string; name: string };

const PRESET_COLORS = [
  { name: "Black", value: "black", hex: "#1a1a1a" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Navy", value: "navy", hex: "#001f3f" },
  { name: "Red", value: "red", hex: "#e74c3c" },
  { name: "Green", value: "green", hex: "#2ecc71" },
  { name: "Maroon", value: "maroon", hex: "#800000" },
  { name: "Beige", value: "beige", hex: "#f5f5dc" },
  { name: "Gold", value: "gold", hex: "#ffd700" },
];

export default function ProductForm({
  mode,
  productId,
  initial,
  categories,
  collections,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial?: any;
  categories: Option[];
  collections: Option[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.product_variants?.length
      ? initial.product_variants.map((v: any) => ({
          colour: v.colour ?? "",
          size: v.size ?? "",
          sku: v.sku ?? "",
          price: v.price?.toString() ?? "",
          stock: v.stock?.toString() ?? "0",
        }))
      : [{ colour: "", size: "", sku: "", price: "", stock: "0" }]
  );
  const [colorPickerOpen, setColorPickerOpen] = useState<number | null>(null);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  function addVariantRow() {
    setVariants([...variants, { colour: "", size: "", sku: "", price: "", stock: "0" }]);
  }
  
  function removeVariantRow(i: number) {
    setVariants(variants.filter((_, idx) => idx !== i));
  }
  
  function updateVariantRow(i: number, field: keyof VariantRow, value: string) {
    setVariants(variants.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  function handleColorSelect(index: number, colorValue: string) {
    updateVariantRow(index, "colour", colorValue);
    setColorPickerOpen(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const base = {
      name,
      slug,
      sku: String(form.get("sku") ?? "") || undefined,
      short_description: String(form.get("short_description") ?? "") || undefined,
      full_description: String(form.get("full_description") ?? "") || undefined,
      category_id: String(form.get("category_id") ?? "") || undefined,
      collection_id: String(form.get("collection_id") ?? "") || undefined,
      price: Number(form.get("price")),
      mrp: Number(form.get("mrp")),
      fabric: String(form.get("fabric") ?? "") || undefined,
      care_instructions: String(form.get("care_instructions") ?? "") || undefined,
      is_featured: form.get("is_featured") === "on",
      is_bestseller: form.get("is_bestseller") === "on",
      is_new_arrival: form.get("is_new_arrival") === "on",
      is_published: form.get("is_published") === "on",
      tags: [] as string[],
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          const product = await createProduct({
            ...base,
            variants: variants.map((v) => ({
              colour: v.colour || undefined,
              size: v.size || undefined,
              sku: v.sku || undefined,
              price: v.price ? Number(v.price) : undefined,
              stock: Number(v.stock) || 0,
              is_active: true,
            })),
          });
          router.push(`/admin/products/${product.id}/edit`);
        } else if (productId) {
          await updateProduct(productId, base);
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message ?? "Could not save product");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && <p className="text-rose text-sm bg-rose/10 p-3 rounded">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="name"
          required
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Product name"
          className="border border-mocha/30 px-3 py-2 text-sm rounded col-span-1 md:col-span-2 focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
        />
        <div>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="slug-like-this"
            className="w-full border border-mocha/30 px-3 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
          />
          <p className="text-xs text-charcoal/40 mt-1">
            Auto-fills from the name — edit it if you want a different URL.
          </p>
        </div>
        <input
          name="sku"
          defaultValue={initial?.sku ?? ""}
          placeholder="SKU"
          className="border border-mocha/30 px-3 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
        />
        <select
          name="category_id"
          defaultValue={initial?.category_id ?? ""}
          className="border border-mocha/30 px-3 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="collection_id"
          defaultValue={initial?.collection_id ?? ""}
          className="border border-mocha/30 px-3 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
        >
          <option value="">No collection</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          step="0.01"
          required
          defaultValue={initial?.price}
          placeholder="Price (₹)"
          className="border border-mocha/30 px-3 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
        />
        <input
          name="mrp"
          type="number"
          step="0.01"
          required
          defaultValue={initial?.mrp}
          placeholder="MRP (₹)"
          className="border border-mocha/30 px-3 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
        />
        <input
          name="fabric"
          defaultValue={initial?.fabric ?? ""}
          placeholder="Fabric"
          className="border border-mocha/30 px-3 py-2 text-sm rounded col-span-1 md:col-span-2 focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
        />
        <textarea
          name="short_description"
          defaultValue={initial?.short_description ?? ""}
          placeholder="Short description"
          className="border border-mocha/30 px-3 py-2 text-sm rounded col-span-1 md:col-span-2 focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition resize-none"
          rows={2}
        />
        <textarea
          name="full_description"
          defaultValue={initial?.full_description ?? ""}
          placeholder="Full description"
          className="border border-mocha/30 px-3 py-2 text-sm rounded col-span-1 md:col-span-2 focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition resize-none"
          rows={4}
        />
        <textarea
          name="care_instructions"
          defaultValue={initial?.care_instructions ?? ""}
          placeholder="Care instructions"
          className="border border-mocha/30 px-3 py-2 text-sm rounded col-span-1 md:col-span-2 focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition resize-none"
          rows={2}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm bg-mocha/5 p-4 rounded">
        <label className="flex items-center gap-2 cursor-pointer hover:text-espresso transition-colors">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={initial?.is_published}
            className="w-4 h-4 cursor-pointer"
          />
          Published
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-espresso transition-colors">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={initial?.is_featured}
            className="w-4 h-4 cursor-pointer"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-espresso transition-colors">
          <input
            type="checkbox"
            name="is_bestseller"
            defaultChecked={initial?.is_bestseller}
            className="w-4 h-4 cursor-pointer"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-espresso transition-colors">
          <input
            type="checkbox"
            name="is_new_arrival"
            defaultChecked={initial?.is_new_arrival}
            className="w-4 h-4 cursor-pointer"
          />
          New Arrival
        </label>
      </div>

      {mode === "create" && (
        <div>
          <h2 className="text-lg text-espresso mb-4 font-semibold">Variants</h2>
          <div className="space-y-3 bg-mocha/5 p-4 rounded">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 items-start bg-white p-3 rounded border border-mocha/15">
                <div className="lg:col-span-2 relative">
                  <label className="text-xs text-charcoal/60 mb-1 block">Colour</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border-2 border-mocha/30 flex-shrink-0"
                      style={{
                        backgroundColor: PRESET_COLORS.find(
                          (c) => c.value === v.colour?.toLowerCase()
                        )?.hex || "#e0e0e0",
                      }}
                    />
                    <input
                      placeholder="e.g. Black"
                      value={v.colour}
                      onChange={(e) => updateVariantRow(i, "colour", e.target.value)}
                      className="flex-1 border border-mocha/30 px-2 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setColorPickerOpen(colorPickerOpen === i ? null : i)
                      }
                      className="px-2 py-1 bg-mocha/10 hover:bg-mocha/20 text-xs rounded transition-colors flex-shrink-0"
                    >
                      Pick
                    </button>
                  </div>
                  {colorPickerOpen === i && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-mocha/30 rounded shadow-lg p-3 z-50 grid grid-cols-4 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => handleColorSelect(i, color.value)}
                          className="relative w-10 h-10 rounded border-2 border-mocha/30 hover:border-mocha/60 hover:scale-110 transition-all cursor-pointer"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {v.colour === color.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-gold rounded-full"></div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 mb-1 block">Size</label>
                  <input
                    placeholder="S, M, L, etc"
                    value={v.size}
                    onChange={(e) => updateVariantRow(i, "size", e.target.value)}
                    className="w-full border border-mocha/30 px-2 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 mb-1 block">SKU</label>
                  <input
                    placeholder="SKU"
                    value={v.sku}
                    onChange={(e) => updateVariantRow(i, "sku", e.target.value)}
                    className="w-full border border-mocha/30 px-2 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 mb-1 block">Price</label>
                  <input
                    placeholder="0"
                    value={v.price}
                    onChange={(e) => updateVariantRow(i, "price", e.target.value)}
                    className="w-full border border-mocha/30 px-2 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 mb-1 block">Stock</label>
                  <input
                    placeholder="0"
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariantRow(i, "stock", e.target.value)}
                    className="w-full border border-mocha/30 px-2 py-2 text-sm rounded focus:border-espresso focus:ring-1 focus:ring-espresso outline-none transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => removeVariantRow(i)}
                    className="flex-1 px-2 py-2 text-xs bg-rose/10 text-rose rounded hover:bg-rose/20 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addVariantRow}
            className="text-sm underline text-charcoal/70 mt-4 hover:text-charcoal transition-colors"
          >
            + Add variant
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full md:w-auto bg-espresso text-ivory px-8 py-3 text-sm tracking-wide font-medium rounded hover:bg-charcoal transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
      </button>

      {mode === "create" && (
        <p className="text-xs text-charcoal/50 bg-mocha/5 p-3 rounded">
          After creating the product, you&apos;ll land on its edit page where you can
          add more variants, upload images, and adjust stock — no code or Supabase
          access needed for any of it.
        </p>
      )}
    </form>
  );
}
