"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Uploads a product image to Storage after validating it server-side.
 * Never trust a file's declared MIME type alone from the client — this
 * checks both the declared type and a magic-byte sniff of the actual
 * content before accepting the upload.
 */
export async function uploadProductImage(formData: FormData) {
  return uploadImage(formData, "product-images", "products");
}

export async function uploadHomepageMedia(formData: FormData) {
  return uploadImage(formData, "homepage-media", "banners");
}

export async function uploadCategoryImage(formData: FormData) {
  return uploadImage(formData, "product-images", "categories");
}

export async function uploadCollectionImage(formData: FormData) {
  return uploadImage(formData, "product-images", "collections");
}

async function uploadImage(formData: FormData, bucket: string, pathPrefix: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image must be under 5MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Magic-byte sniff so a renamed .exe with a .jpg extension can't sneak through.
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  const isWebp =
    buffer.slice(0, 4).toString("ascii") === "RIFF" &&
    buffer.slice(8, 12).toString("ascii") === "WEBP";

  if (!isJpeg && !isPng && !isWebp) {
    throw new Error("File content does not match a valid image format");
  }

  const supabase = createAdminClient();
  const ext = file.type.split("/")[1];
  const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl.publicUrl;
}
