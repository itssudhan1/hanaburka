import HomepageEditor from "@/components/admin/HomepageEditor";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHomepagePage() {
  const supabase = createAdminClient();
  const { data: sections } = await supabase
    .from("homepage_sections")
    .select("section_key, content");

  const map = Object.fromEntries((sections ?? []).map((s) => [s.section_key, s.content]));

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Homepage</h1>
      <HomepageEditor
        announcement={map.announcement_bar ?? {}}
        hero={map.hero ?? {}}
        whyHana={map.why_hana ?? {}}
        newsletter={map.newsletter ?? {}}
      />
      <p className="text-xs text-charcoal/50 mt-8 max-w-xl">
        Banner placement on the homepage still isn&apos;t wired in — manage
        banners under Admin → Banners, but they don&apos;t render anywhere yet.
      </p>
    </div>
  );
}
