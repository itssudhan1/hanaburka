"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const categorySchema = z.object({
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

export async function createCategory(input: z.infer<typeof categorySchema>) {
  // Any admin (SUPER_ADMIN or ADMIN) may manage categories, per the ADMIN
  // role's permission list in the spec.
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);

  const parsed = categorySchema.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .insert(parsed)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return data;
}

export async function updateCategory(
  id: string,
  input: Partial<z.infer<typeof categorySchema>>
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);

  const parsed = categorySchema.partial().parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .update(parsed)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return data;
}

export async function deleteCategory(id: string) {
  // Deleting a category can orphan products site-wide — restrict to SUPER_ADMIN.
  await requireAdmin(["SUPER_ADMIN"]);

  const supabase = createAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export async function reorderCategories(orderedIds: string[]) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("categories").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/");
  revalidatePath("/admin/categories");
}
