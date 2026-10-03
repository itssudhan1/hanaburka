"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const couponSchema = z.object({
  code: z.string().min(3).max(40).toUpperCase(),
  type: z.enum(["percentage", "flat"]),
  value: z.number().positive(),
  min_order_amount: z.number().positive().optional(),
  max_discount_amount: z.number().positive().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  usage_limit: z.number().int().positive().optional(),
  first_order_only: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export async function createCoupon(input: z.infer<typeof couponSchema>) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = couponSchema.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("coupons").insert(parsed).select().single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/coupons");
  return data;
}

export async function toggleCoupon(id: string, isActive: boolean) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(id: string) {
  await requireAdmin(["SUPER_ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}
