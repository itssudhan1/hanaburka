import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutMode } from "@/lib/actions/checkout";
import { getWhatsAppNumber } from "@/lib/config";

export default async function CheckoutPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl mb-4">Checkout</h1>
          <p className="text-charcoal/70 mb-8">Sign in to check out.</p>
          <Link href="/login" className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide">
            SIGN IN
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const [{ data: items }, mode, whatsappNumber, { data: shippingSetting }] =
    await Promise.all([
      supabase
        .from("cart_items")
        .select(
          `id, quantity,
           variant:product_variants(id, colour, size, price,
             product:products(name, price))`
        )
        .eq("user_id", user.id)
        .eq("saved_for_later", false),
      getCheckoutMode(),
      getWhatsAppNumber(),
      supabase.from("site_settings").select("value").eq("key", "shipping").single(),
    ]);

  if (!items || items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl mb-4">Checkout</h1>
          <p className="text-charcoal/70 mb-8">Your bag is empty.</p>
          <Link href="/shop" className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide">
            CONTINUE SHOPPING
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = items.reduce((sum: number, i: any) => {
    const price = i.variant.price ?? i.variant.product.price;
    return sum + price * i.quantity;
  }, 0);

  const shippingConfig = (shippingSetting?.value ?? {}) as {
    free_threshold?: number;
    flat_fee?: number;
  };
  const shippingFee =
    subtotal >= (shippingConfig.free_threshold ?? 1999)
      ? 0
      : shippingConfig.flat_fee ?? 99;

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-[1fr_320px] gap-12">
        <div>
          <h1 className="text-3xl mb-8">Checkout</h1>
          {mode === "whatsapp" && !whatsappNumber && (
            <p className="text-rose text-sm mb-6">
              WhatsApp ordering is enabled but no number is configured yet —
              set one in Admin → Settings before customers can complete an
              order this way.
            </p>
          )}
          <CheckoutForm mode={mode} whatsappNumber={whatsappNumber} />
        </div>

        <div className="border border-mocha/15 p-6 h-fit">
          <h2 className="text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm mb-4">
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.variant.product.name} × {item.quantity}
                </span>
                <span>
                  ₹{((item.variant.price ?? item.variant.product.price) * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-mocha/15 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : `₹${shippingFee}`}</span>
            </div>
            <div className="flex justify-between text-espresso font-medium pt-2 border-t border-mocha/15 mt-2">
              <span>Estimated Total</span>
              <span>₹{(subtotal + shippingFee).toLocaleString("en-IN")}</span>
            </div>
            <p className="text-xs text-charcoal/50 pt-2">
              Final total is confirmed by the server when you place your order.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
