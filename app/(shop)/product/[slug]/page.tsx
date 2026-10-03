import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/product/ImageGallery";
import VariantSelector from "@/components/product/VariantSelector";
import ProductCard from "@/components/product/ProductCard";
import WishlistButton from "@/components/product/WishlistButton";
import {
  getProductBySlug,
  getApprovedReviews,
  getRelatedProducts,
} from "@/lib/queries/products";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://hanaburka.com"; // update once the domain is live

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const title = product.seo_title || `${product.name} | HANA BURKA`;
  const description =
    product.seo_description || product.short_description || undefined;
  const image = product.product_images?.find((i: any) => i.is_primary)?.url
    ?? product.product_images?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${product.slug}`,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isWishlisted = false;
  if (user) {
    const { data: wishlistItem } = await supabase
      .from("wishlist_items")
      .select("id, wishlists!inner(user_id)")
      .eq("product_id", product.id)
      .eq("wishlists.user_id", user.id)
      .maybeSingle();
    isWishlisted = !!wishlistItem;
  }

  const [reviews, related, { data: buyNowSetting }] = await Promise.all([
    getApprovedReviews(product.id),
    getRelatedProducts(product.category_id, product.id),
    supabase.from("site_settings").select("value").eq("key", "show_buy_now").single(),
  ]);
  const showBuyNow = (buyNowSetting?.value as { enabled?: boolean })?.enabled ?? true;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const primaryImage = product.product_images?.find((i: any) => i.is_primary)?.url
    ?? product.product_images?.[0]?.url;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: primaryImage ? [primaryImage] : undefined,
    description: product.short_description ?? undefined,
    sku: product.sku ?? undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: (product.product_variants ?? []).some((v: any) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: reviews.length,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      ...(product.category
        ? [{
            "@type": "ListItem",
            position: 3,
            name: product.category.name,
            item: `${SITE_URL}/shop?category=${product.category.slug}`,
          }]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: `${SITE_URL}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        <ImageGallery
          images={(product.product_images ?? []).sort(
            (a: any, b: any) => a.sort_order - b.sort_order
          )}
        />

        <div>
          {product.category && (
            <p className="text-sm text-mocha mb-2">{product.category.name}</p>
          )}
          <h1 className="text-3xl mb-2">{product.name}</h1>
          {product.sku && (
            <p className="text-xs text-charcoal/50 mb-4">SKU: {product.sku}</p>
          )}
          {avgRating && (
            <p className="text-sm text-charcoal/70 mb-4">
              ★ {avgRating.toFixed(1)} ({reviews.length} review
              {reviews.length !== 1 ? "s" : ""})
            </p>
          )}

          <VariantSelector
            variants={product.product_variants ?? []}
            basePrice={product.price}
            showBuyNow={showBuyNow}
            imageUrl={primaryImage}
          />

          <div className="mt-4">
            <WishlistButton productId={product.id} initialWishlisted={isWishlisted} />
          </div>

          {product.short_description && (
            <p className="mt-8 text-charcoal/80 leading-relaxed">
              {product.short_description}
            </p>
          )}

          <div className="mt-8 divide-y divide-mocha/15 text-sm">
            {product.full_description && (
              <details className="py-4" open>
                <summary className="cursor-pointer text-espresso">
                  Description
                </summary>
                <p className="mt-2 text-charcoal/70 leading-relaxed">
                  {product.full_description}
                </p>
              </details>
            )}
            {product.fabric && (
              <details className="py-4">
                <summary className="cursor-pointer text-espresso">Fabric</summary>
                <p className="mt-2 text-charcoal/70">{product.fabric}</p>
              </details>
            )}
            {product.care_instructions && (
              <details className="py-4">
                <summary className="cursor-pointer text-espresso">
                  Care Instructions
                </summary>
                <p className="mt-2 text-charcoal/70 leading-relaxed">
                  {product.care_instructions}
                </p>
              </details>
            )}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-12 border-t border-mocha/15">
          <h2 className="text-2xl mb-8">Reviews</h2>
          <div className="space-y-6 max-w-prose">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-mocha/10 pb-6">
                <p className="text-sm mb-1">{"★".repeat(r.rating)}</p>
                {r.title && <p className="text-espresso mb-1">{r.title}</p>}
                {r.body && (
                  <p className="text-charcoal/70 text-sm leading-relaxed">
                    {r.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-12 border-t border-mocha/15">
          <h2 className="text-2xl mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 sm:gap-6">
            {related.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
