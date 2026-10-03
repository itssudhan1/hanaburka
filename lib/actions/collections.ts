"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const collectionSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-with-hyphens"),
  description: z.string().max(2000).optional(),
  image_url: z.string().url().optional(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
  seo_title: z.string().max(160).optional(),
  seo_description: z.string().max(300).optional(),
});

export async function createCollection(input: z.infer<typeof collectionSchema>) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = collectionSchema.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("collections")
    .insert(parsed)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/collections");
  return data;
}

export async function updateCollection(
  id: string,
  input: Partial<z.infer<typeof collectionSchema>>
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = collectionSchema.partial().parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("collections")
    .update(parsed)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/collections");
  return data;
}

export async function deleteCollection(id: string) {
  await requireAdmin(["SUPER_ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/collections");
}
