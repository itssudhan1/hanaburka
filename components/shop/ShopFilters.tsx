"use client";

import { useRef, useEffect, useState } from "react";

type Option = { label: string; value: string };

export default function ShopFilters({
  categories,
  collections,
  current,
}: {
  categories: Option[];
  collections: Option[];
  current: { [key: string]: string | undefined };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        setIsSticky(rect.top < 0);
      }
    };

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    
    if (mediaQuery.matches) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const handleApplyClick = (e: React.MouseEvent) => {
    if (isSticky && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <form
        ref={formRef}
        method="get"
        className="md:space-y-8 md:pr-6 md:border-r md:border-mocha/15 text-sm space-y-6 pr-4 md:pr-6"
      >
        {current.q && <input type="hidden" name="q" value={current.q} />}

        <div>
          <h3 className="text-espresso mb-3 font-medium text-sm md:text-base">Category</h3>
          <select
            name="category"
            defaultValue={current.category ?? ""}
            className="w-full border border-mocha/30 bg-transparent py-2.5 px-3 text-sm rounded-sm hover:border-mocha/50 transition-colors"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-espresso mb-3 font-medium text-sm md:text-base">Collection</h3>
          <select
            name="collection"
            defaultValue={current.collection ?? ""}
            className="w-full border border-mocha/30 bg-transparent py-2.5 px-3 text-sm rounded-sm hover:border-mocha/50 transition-colors"
          >
            <option value="">All</option>
            {collections.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-espresso mb-3 font-medium text-sm md:text-base">Price</h3>
          <div className="flex gap-2">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              defaultValue={current.minPrice ?? ""}
              className="flex-1 border border-mocha/30 bg-transparent py-2.5 px-3 text-sm rounded-sm hover:border-mocha/50 transition-colors"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              defaultValue={current.maxPrice ?? ""}
              className="flex-1 border border-mocha/30 bg-transparent py-2.5 px-3 text-sm rounded-sm hover:border-mocha/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <h3 className="text-espresso mb-3 font-medium text-sm md:text-base">Size</h3>
          <select
            name="size"
            defaultValue={current.size ?? ""}
            className="w-full border border-mocha/30 bg-transparent py-2.5 px-3 text-sm rounded-sm hover:border-mocha/50 transition-colors"
          >
            <option value="">All</option>
            {["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "Custom"].map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <h3 className="text-espresso mb-3 font-medium text-sm md:text-base">Colour</h3>
          <div className="space-y-3">
            <input
              type="text"
              name="colour"
              placeholder="e.g. Black"
              defaultValue={current.colour ?? ""}
              className="w-full border border-mocha/30 bg-transparent py-2.5 px-3 text-sm rounded-sm hover:border-mocha/50 transition-colors"
            />
            {/* Color picker - visual aid for popular colors */}
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Black", value: "black", hex: "#1a1a1a" },
                { name: "White", value: "white", hex: "#ffffff" },
                { name: "Navy", value: "navy", hex: "#001f3f" },
                { name: "Green", value: "green", hex: "#2ecc71" },
                { name: "Maroon", value: "maroon", hex: "#800000" },
                { name: "Grey", value: "grey", hex: "#95a5a6" },
              ].map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    const input = document.querySelector(
                      'input[name="colour"]'
                    ) as HTMLInputElement;
                    if (input) {
                      input.value = color.value;
                      input.dispatchEvent(new Event("change", { bubbles: true }));
                    }
                  }}
                  className="relative w-8 h-8 rounded-full border-2 border-mocha/30 hover:border-mocha/60 transition-colors cursor-pointer group"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer hover:text-espresso transition-colors">
          <input
            type="checkbox"
            name="inStockOnly"
            value="true"
            defaultChecked={current.inStockOnly === "true"}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm">In stock only</span>
        </label>

        <div>
          <h3 className="text-espresso mb-3 font-medium text-sm md:text-base">Sort by</h3>
          <select
            name="sort"
            defaultValue={current.sort ?? "newest"}
            className="w-full border border-mocha/30 bg-transparent py-2.5 px-3 text-sm rounded-sm hover:border-mocha/50 transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="bestselling">Best Selling</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        <button
          type="submit"
          onClick={handleApplyClick}
          className="w-full bg-espresso text-ivory py-3 px-4 text-sm tracking-wide hover:bg-charcoal transition-colors font-medium rounded-sm md:rounded-none"
        >
          Apply Filters
        </button>
      </form>

      {/* Mobile fixed button when form is out of view */}
      {isSticky && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-mocha/15 p-3 z-40">
          <button
            type="button"
            onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="w-full bg-espresso text-ivory py-3 px-4 text-sm tracking-wide hover:bg-charcoal transition-colors font-medium rounded-sm"
          >
            ↑ Scroll to Filters
          </button>
        </div>
      )}
    </>
  );
}
