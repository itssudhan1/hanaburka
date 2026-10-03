"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveReview(reviewId: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", reviewId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
}

export async function rejectReview(reviewId: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
}
