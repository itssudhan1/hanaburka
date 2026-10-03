"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addVariant, updateVariant, deleteVariant } from "@/lib/actions/products";

type Variant = {
  id: string;
  colour: string | null;
  size: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
};

const PRESET_COLORS = [
  { name: "Black", value: "black", hex: "#1a1a1a" },
  { name: "White", value: "white", hex: "#ffffff" },
  { name: "Navy", value: "navy", hex: "#001f3f" },
  { name: "Red", value: "red", hex: "#e74c3c" },
  { name: "Green", value: "green", hex: "#2ecc71" },
  { name: "Maroon", value: "maroon", hex: "#800000" },
  { name: "Beige", value: "beige", hex: "#f5f5dc" },
  { name: "Gold", value: "gold", hex: "#ffd700" },
  { name: "Silver", value: "silver", hex: "#c0c0c0" },
  { name: "Pink", value: "pink", hex: "#ffb6c1" },
  { name: "Purple", value: "purple", hex: "#9b59b6" },
  { name: "Grey", value: "grey", hex: "#95a5a6" },
];

export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, Partial<Variant>>>({});
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [newRow, setNewRow] = useState({ colour: "", size: "", sku: "", price: "", stock: "0" });
  const [showNewRow, setShowNewRow] = useState(false);
  const [showNewColorPicker, setShowNewColorPicker] = useState(false);

  function fieldFor(v: Variant, key: keyof Variant) {
    return editing[v.id]?.[key] ?? v[key] ?? "";
  }
  
  function setField(id: string, key: keyof Variant, value: any) {
    setEditing({ ...editing, [id]: { ...editing[id], [key]: value } });
  }

  const handleColorSelect = (variantId: string, colorValue: string) => {
    setField(variantId, "colour", colorValue);
    setShowColorPicker(null);
  };

  const handleNewColorSelect = (colorValue: string) => {
    setNewRow({ ...newRow, colour: colorValue });
    setShowNewColorPicker(false);
  };

  return (
    <div className="w-full overflow-x-auto">
      {error && <p className="text-rose text-sm mb-2">{error}</p>}
      
      <div className="min-w-full">
        <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-2 mb-2 text-xs font-semibold text-charcoal/70 p-3 bg-mocha/5 rounded">
          <div>Colour</div>
          <div>Size</div>
          <div>SKU</div>
          <div>Price</div>
          <div>Stock</div>
          <div></div>
        </div>

        <div className="space-y-1 border border-mocha/15 bg-white rounded overflow-hidden">
          {variants.map((v) => (
            <div
              key={v.id}
              className="grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-2 items-center p-3 border-b border-mocha/10 hover:bg-ivory/50 transition-colors text-sm"
            >
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-mocha/30"
                    style={{
                      backgroundColor: PRESET_COLORS.find(
                        (c) => c.value === (fieldFor(v, "colour") as string)?.toLowerCase()
                      )?.hex || "#e0e0e0",
                    }}
                  />
                  <input
                    value={fieldFor(v, "colour") as string}
                    onChange={(e) => setField(v.id, "colour", e.target.value)}
                    placeholder="e.g. Black"
                    className="flex-1 border border-mocha/20 px-2 py-2 text-sm rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowColorPicker(
                        showColorPicker === v.id ? null : v.id
                      )
                    }
                    className="px-2 py-1 bg-mocha/10 hover:bg-mocha/20 text-xs rounded transition-colors"
                  >
                    Picker
                  </button>
                </div>
                {showColorPicker === v.id && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-mocha/30 rounded shadow-lg p-3 z-50 grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(v.id, color.value)}
                        className="relative w-10 h-10 rounded border-2 border-mocha/30 hover:border-mocha/60 hover:scale-110 transition-all cursor-pointer group"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {(fieldFor(v, "colour") as string) === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gold rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                value={fieldFor(v, "size") as string}
                onChange={(e) => setField(v.id, "size", e.target.value)}
                placeholder="S"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />

              <input
                value={fieldFor(v, "sku") as string}
                onChange={(e) => setField(v.id, "sku", e.target.value)}
                placeholder="SKU"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />

              <input
                type="number"
                value={fieldFor(v, "price") as string}
                onChange={(e) => setField(v.id, "price", e.target.value)}
                placeholder="0"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />

              <input
                type="number"
                value={fieldFor(v, "stock") as string}
                onChange={(e) => setField(v.id, "stock", e.target.value)}
                placeholder="0"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />

              <div className="flex gap-1">
                {editing[v.id] && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          const e = editing[v.id];
                          await updateVariant(v.id, {
                            colour: e.colour as string,
                            size: e.size as string,
                            sku: e.sku as string,
                            price: e.price ? Number(e.price) : undefined,
                            stock: e.stock !== undefined ? Number(e.stock) : undefined,
                          });
                          setEditing({ ...editing, [v.id]: {} });
                          router.refresh();
                        } catch (err: any) {
                          setError(err.message ?? "Could not save variant");
                        }
                      })
                    }
                    className="px-2 py-1 text-xs bg-espresso text-ivory rounded hover:bg-charcoal transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                )}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    if (!confirm("Delete this variant?")) return;
                    startTransition(async () => {
                      await deleteVariant(v.id);
                      router.refresh();
                    });
                  }}
                  className="px-2 py-1 text-xs bg-rose/10 text-rose rounded hover:bg-rose/20 transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {showNewRow && (
            <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr_1fr] gap-2 items-center p-3 bg-ivory border-t-2 border-espresso text-sm">
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-mocha/30"
                    style={{
                      backgroundColor: PRESET_COLORS.find(
                        (c) => c.value === newRow.colour?.toLowerCase()
                      )?.hex || "#e0e0e0",
                    }}
                  />
                  <input
                    value={newRow.colour}
                    onChange={(e) => setNewRow({ ...newRow, colour: e.target.value })}
                    placeholder="e.g. Black"
                    className="flex-1 border border-mocha/20 px-2 py-2 text-sm rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewColorPicker(!showNewColorPicker)}
                    className="px-2 py-1 bg-mocha/10 hover:bg-mocha/20 text-xs rounded transition-colors"
                  >
                    Picker
                  </button>
                </div>
                {showNewColorPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-mocha/30 rounded shadow-lg p-3 z-50 grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleNewColorSelect(color.value)}
                        className="relative w-10 h-10 rounded border-2 border-mocha/30 hover:border-mocha/60 hover:scale-110 transition-all cursor-pointer"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {newRow.colour === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gold rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                value={newRow.size}
                onChange={(e) => setNewRow({ ...newRow, size: e.target.value })}
                placeholder="S"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />
              <input
                value={newRow.sku}
                onChange={(e) => setNewRow({ ...newRow, sku: e.target.value })}
                placeholder="SKU"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />
              <input
                type="number"
                value={newRow.price}
                onChange={(e) => setNewRow({ ...newRow, price: e.target.value })}
                placeholder="0"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />
              <input
                type="number"
                value={newRow.stock}
                onChange={(e) => setNewRow({ ...newRow, stock: e.target.value })}
                placeholder="0"
                className="border border-mocha/20 px-2 py-2 text-sm rounded"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await addVariant(productId, {
                        colour: newRow.colour || undefined,
                        size: newRow.size || undefined,
                        sku: newRow.sku || undefined,
                        price: newRow.price ? Number(newRow.price) : undefined,
                        stock: Number(newRow.stock) || 0,
                      });
                      setNewRow({ colour: "", size: "", sku: "", price: "", stock: "0" });
                      setShowNewRow(false);
                      router.refresh();
                    } catch (err: any) {
                      setError(err.message ?? "Could not add variant");
                    }
                  })
                }
                className="px-2 py-1 text-xs bg-espresso text-ivory rounded hover:bg-charcoal transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {!showNewRow && (
        <button
          type="button"
          onClick={() => setShowNewRow(true)}
          className="text-sm underline text-charcoal/70 mt-4 hover:text-charcoal transition-colors"
        >
          + Add variant
        </button>
      )}
    </div>
  );
}
