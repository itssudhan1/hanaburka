import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartItemRow from "@/components/cart/CartItemRow";
import { getCartItems } from "@/lib/actions/cart";

export default async function CartPage() {
  const { signedIn, active, saved, subtotal } = await getCartItems();

  if (!signedIn) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl mb-4">Your Bag</h1>
          <p className="text-charcoal/70 mb-8">Sign in to view your bag.</p>
          <Link
            href="/login"
            className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors"
          >
            SIGN IN
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl mb-8">Your Bag</h1>

        {active.length === 0 && saved.length === 0 ? (
          <div className="py-16 text-center text-charcoal/60">
            <p className="mb-6">Your bag is empty.</p>
            <Link
              href="/shop"
              className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-12">
            <div>
              {active.length === 0 ? (
                <p className="text-charcoal/60 py-6">
                  No items in your bag —{" "}
                  <Link href="/shop" className="underline">
                    continue shopping
                  </Link>
                  .
                </p>
              ) : (
                active.map((item: any) => <CartItemRow key={item.id} item={item} />)
              )}

              {saved.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl mb-4">Saved for Later</h2>
                  {saved.map((item: any) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            <div className="border border-mocha/15 p-6 h-fit">
              <div className="flex justify-between text-sm mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs text-charcoal/50 mb-4">
                Shipping and any discounts are calculated at checkout.
              </p>
              <Link
                href="/checkout"
                className={`block text-center w-full bg-espresso text-ivory py-3 text-sm tracking-wide hover:bg-charcoal transition-colors ${
                  active.length === 0 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                PROCEED TO CHECKOUT
              </Link>
              <Link
                href="/shop"
                className="block text-center text-sm text-charcoal/70 underline mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
