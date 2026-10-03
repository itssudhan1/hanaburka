"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setCheckoutMode(mode: "whatsapp" | "razorpay") {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ value: { mode }, updated_at: new Date().toISOString() })
    .eq("key", "checkout_mode");
  if (error) throw new Error(error.message);

  revalidatePath("/checkout");
}

export async function setWhatsappNumber(number: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ value: { number }, updated_at: new Date().toISOString() })
    .eq("key", "whatsapp");
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function setBusinessInfo(info: {
  name: string;
  address: string;
  phone: string;
  phoneSecondary?: string;
}) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "business_info", value: info, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/contact");
}

export async function setShowBuyNow(show: boolean) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "show_buy_now", value: { enabled: show }, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) throw new Error(error.message);

  revalidatePath("/product", "layout");
}

export async function setCustomerCareLinks(links: { label: string; url: string }[]) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "footer_customer_care", value: { links }, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function setPageContent(slug: string, title: string, body: string) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: `page_content:${slug}`, value: { title, body }, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) throw new Error(error.message);

  revalidatePath(`/${slug}`);
}
