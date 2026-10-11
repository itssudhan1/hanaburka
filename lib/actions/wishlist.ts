"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addToCart } from "@/lib/actions/cart";
import type { ActionResult } from "@/lib/actions/result";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to use your wishlist");
  return { supabase, user };
}

async function getOrCreateWishlist(supabase: any, userId: string) {
  const { data } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .single();
  if (data) return data.id;

  const { data: created, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created.id;
}

export async function toggleWishlist(
  productId: string
): Promise<ActionResult<{ wishlisted: boolean }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Returned, not thrown — see lib/actions/result.ts.
  if (!user) {
    return { ok: false, code: "NOT_SIGNED_IN", message: "Sign in to use your wishlist" };
  }

  try {
    const wishlistId = await getOrCreateWishlist(supabase, user.id);

    const { data: existing } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("wishlist_id", wishlistId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      await supabase.from("wishlist_items").delete().eq("id", existing.id);
    } else {
      await supabase
        .from("wishlist_items")
        .insert({ wishlist_id: wishlistId, product_id: productId });
    }

    revalidatePath("/wishlist");
    revalidatePath("/product");
    return { ok: true, wishlisted: !existing };
  } catch (err) {
    console.error("toggleWishlist failed:", err);
    return { ok: false, code: "FAILED", message: "Could not update your wishlist. Please try again." };
  }
}

export async function removeWishlistItem(itemId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("wishlist_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
  revalidatePath("/wishlist");
}

export async function moveWishlistItemToCart(
  wishlistItemId: string,
  variantId: string
) {
  const result = await addToCart(variantId, 1);
  if (!result.ok) throw new Error(result.message);
  await removeWishlistItem(wishlistItemId);
}
