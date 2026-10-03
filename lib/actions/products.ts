"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const variantSchema = z.object({
  sku: z.string().max(60).optional(),
  colour: z.string().max(60).optional(),
  size: z.string().max(20).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  image_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-with-hyphens"),
  sku: z.string().max(60).optional(),
  short_description: z.string().max(500).optional(),
  full_description: z.string().max(5000).optional(),
  category_id: z.string().uuid().optional(),
  collection_id: z.string().uuid().optional(),
  // Never trust a client-submitted final price for checkout math — this is
  // the admin-set catalog price, still re-validated server-side at checkout.
  price: z.number().positive(),
  mrp: z.number().positive(),
  fabric: z.string().max(100).optional(),
  length: z.string().max(100).optional(),
  style: z.string().max(100).optional(),
  care_instructions: z.string().max(2000).optional(),
  tags: z.array(z.string()).default([]),
  video_url: z.string().url().optional(),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_published: z.boolean().default(false),
  seo_title: z.string().max(160).optional(),
  seo_description: z.string().max(300).optional(),
  variants: z.array(variantSchema).min(1, "at least one variant is required"),
});

export async function createProduct(input: z.infer<typeof productSchema>) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = productSchema.parse(input);
  const { variants, ...productFields } = parsed;
  const supabase = createAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(productFields)
    .select()
    .single();
  if (productError) throw new Error(productError.message);

  const { error: variantError } = await supabase.from("product_variants").insert(
    variants.map((v) => ({ ...v, product_id: product.id }))
  );
  if (variantError) {
    // Roll back the product so we don't leave an orphan with zero variants.
    await supabase.from("products").delete().eq("id", product.id);
    throw new Error(variantError.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<z.infer<typeof productSchema>, "variants">>
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = productSchema.omit({ variants: true }).partial().parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .update(parsed)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/admin/products");
  return data;
}

export async function deleteProduct(id: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function duplicateProduct(id: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { data: original, error: fetchError } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { id: _id, created_at, updated_at, product_variants, ...rest } =
    original as any;

  const { data: copy, error: insertError } = await supabase
    .from("products")
    .insert({
      ...rest,
      name: `${rest.name} (Copy)`,
      slug: `${rest.slug}-copy-${Date.now()}`,
      sku: null,
      is_published: false,
    })
    .select()
    .single();
  if (insertError) throw new Error(insertError.message);

  if (product_variants?.length) {
    await supabase.from("product_variants").insert(
      product_variants.map((v: any) => ({
        product_id: copy.id,
        colour: v.colour,
        size: v.size,
        price: v.price,
        stock: 0, // duplicated products start with zero stock, admin sets it
        is_active: v.is_active,
      }))
    );
  }

  revalidatePath("/admin/products");
  return copy;
}

export async function setProductStock(variantId: string, stock: number) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN", "STAFF"]);
  if (stock < 0) throw new Error("Stock cannot be negative");

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_variants")
    .update({ stock })
    .eq("id", variantId);
  if (error) throw new Error(error.message);
  // The DB trigger (trg_sync_inventory) keeps `inventory.available` in sync
  // and writes the audit log row automatically — no need to duplicate here.

  revalidatePath("/admin/inventory");
}

export async function addProductImage(
  productId: string,
  url: string,
  opts?: { variantId?: string; altText?: string; isPrimary?: boolean }
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  if (opts?.isPrimary) {
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      variant_id: opts?.variantId ?? null,
      url,
      alt_text: opts?.altText ?? null,
      is_primary: opts?.isPrimary ?? false,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  return data;
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
}

const newVariantSchema = z.object({
  colour: z.string().max(60).optional(),
  size: z.string().max(20).optional(),
  sku: z.string().max(60).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
});

export async function addVariant(
  productId: string,
  input: z.infer<typeof newVariantSchema>
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = newVariantSchema.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_variants")
    .insert({ ...parsed, product_id: productId, is_active: true })
    .select()
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  return data;
}

export async function updateVariant(
  variantId: string,
  input: Partial<z.infer<typeof newVariantSchema>>
) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const parsed = newVariantSchema.partial().parse(input);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("product_variants")
    .update(parsed)
    .eq("id", variantId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
}

export async function deleteVariant(variantId: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
}
