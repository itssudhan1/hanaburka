import BannerManager from "@/components/admin/BannerManager";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminBannersPage() {
  const supabase = createAdminClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Banners</h1>
      <BannerManager banners={banners ?? []} />
      <p className="text-xs text-charcoal/50 mt-6">
        Banners are stored and manageable here, but no page currently
        displays them yet — the homepage doesn&apos;t have a banner slot wired
        in. Flagged as remaining.
      </p>
    </div>
  );
}
