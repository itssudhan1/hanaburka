"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateHomepageSection(sectionKey: string, content: any) {
  await requireAdmin(["SUPER_ADMIN", "ADMIN"]);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("homepage_sections")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("section_key", sectionKey);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/homepage");
}
