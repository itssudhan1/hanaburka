import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/product/ProductCard";
import StaggerGroup from "@/components/motion/StaggerGroup";
import Reveal from "@/components/motion/Reveal";
import { getProducts } from "@/lib/queries/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  // Show the full catalog by default (browsable), narrowing as the
  // customer types — rather than an empty page prompting for input.
  const products = await getProducts(q ? { q } : {});

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <form method="get" className="mb-10 max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search for burkas, abayas, hijabs..."
            className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-rose transition-colors"
            autoFocus
          />
        </form>

        {products.length === 0 ? (
          <Reveal>
            <div className="py-16 text-center text-charcoal/60">
              {q ? (
                <>
                  <p className="mb-2">No results for &ldquo;{q}&rdquo;.</p>
                  <p className="text-sm">Try a different search term.</p>
                </>
              ) : (
                <p>No products published yet.</p>
              )}
            </div>
          </Reveal>
        ) : (
          <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggerGroup>
        )}
      </div>
      <Footer />
    </>
  );
}
