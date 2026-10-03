import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/Footer";
import ProductCard from "@/components/product/ProductCard";
import { createClient } from "@/lib/supabase/server";

export default async function WishlistPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Navbar />
        <AuthCard title="Your Wishlist" subtitle="Sign in to see the pieces you've saved.">
          <LoginForm redirectTo="/wishlist" />
        </AuthCard>
        <Footer />
      </>
    );
  }

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select(
      `wishlist_items(id, product:products(id, name, slug, price, mrp, product_images(url, is_primary)))`
    )
    .eq("user_id", user.id)
    .single();

  const items = wishlist?.wishlist_items ?? [];

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl mb-8">Your Wishlist</h1>

        {items.length === 0 ? (
          <div className="py-16 text-center text-charcoal/60">
            <p className="mb-6">Your wishlist is empty.</p>
            <Link
              href="/shop"
              className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-8 sm:gap-6">
            {items.map((item: any) => (
              <ProductCard key={item.id} product={item.product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
