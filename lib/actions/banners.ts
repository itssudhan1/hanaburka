"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const bannerSchema = z.object({
  title: z.string().max(200).optional(),
  image_url: z.string().url(),
  link_url: z.string().url().optional(),
  placement: z.string().default("homepage"),
  sort_order: z.number().int().default(0),
});

export async function createBanner(input: z.infer<typeof bannerSchema>) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = bannerSchema.parse(input);
  const supabase = createAdminClient();

  const { error } = await supabase.from("banners").insert(parsed);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function toggleBanner(id: string, isActive: boolean) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("banners").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/banners");
}

export async function deleteBanner(id: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/banners");
}
