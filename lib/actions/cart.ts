"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/result";

class NotSignedInError extends Error {}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new NotSignedInError("Sign in to use your cart");
  return { supabase, user };
}

export async function addToCart(
  variantId: string,
  quantity: number
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Returned, not thrown — see lib/actions/result.ts for why a thrown
  // "Sign in" error never reaches the browser intact in production.
  if (!user) {
    return { ok: false, code: "NOT_SIGNED_IN", message: "Sign in to use your cart" };
  }

  // Check stock before adding — never let the cart exceed what's actually
  // available, even though the real oversell guard is at checkout time.
  const { data: variant } = await supabase
    .from("product_variants")
    .select("stock")
    .eq("id", variantId)
    .single();

  if (!variant || variant.stock < quantity) {
    return { ok: false, code: "FAILED", message: "Not enough stock available" };
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("variant_id", variantId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) {
      console.error("addToCart update failed:", error.message);
      return { ok: false, code: "FAILED", message: "Could not add to bag. Please try again." };
    }
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ user_id: user.id, variant_id: variantId, quantity });
    if (error) {
      console.error("addToCart insert failed:", error.message);
      return { ok: false, code: "FAILED", message: "Could not add to bag. Please try again." };
    }
  }

  revalidatePath("/cart");
  // The cart count badge in the navbar renders on every page (each page
  // fetches it fresh via the Navbar server component), not just /cart —
  // so a mutation from a product page needs the whole app revalidated,
  // or the badge would only refresh once the shopper happens to visit /cart.
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const { supabase } = await requireUser();
  if (quantity < 1) throw new Error("Quantity must be at least 1");

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/cart");
  // The cart count badge in the navbar renders on every page (each page
  // fetches it fresh via the Navbar server component), not just /cart —
  // so a mutation from a product page needs the whole app revalidated,
  // or the badge would only refresh once the shopper happens to visit /cart.
  revalidatePath("/", "layout");
}

export async function removeCartItem(itemId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/cart");
  // The cart count badge in the navbar renders on every page (each page
  // fetches it fresh via the Navbar server component), not just /cart —
  // so a mutation from a product page needs the whole app revalidated,
  // or the badge would only refresh once the shopper happens to visit /cart.
  revalidatePath("/", "layout");
}

// Shared by the full /cart page and the cart drawer, so the two can never
// drift out of sync. Doesn't throw when signed out — a drawer that can pop
// open on ANY page needs to show a "sign in" state gracefully, not crash.
export async function getCartItems() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { signedIn: false as const, active: [], saved: [], subtotal: 0 };
  }

  const { data: items } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, saved_for_later,
       variant:product_variants(id, colour, size, price, stock, image_url,
         product:products(name, slug, price))`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const active = (items ?? []).filter((i: any) => !i.saved_for_later);
  const saved = (items ?? []).filter((i: any) => i.saved_for_later);
  const subtotal = active.reduce((sum: number, i: any) => {
    const price = i.variant.price ?? i.variant.product.price;
    return sum + price * i.quantity;
  }, 0);

  return { signedIn: true as const, active, saved, subtotal };
}

export async function toggleSaveForLater(itemId: string, saved: boolean) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("cart_items")
    .update({ saved_for_later: saved })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/cart");
  // The cart count badge in the navbar renders on every page (each page
  // fetches it fresh via the Navbar server component), not just /cart —
  // so a mutation from a product page needs the whole app revalidated,
  // or the badge would only refresh once the shopper happens to visit /cart.
  revalidatePath("/", "layout");
}
