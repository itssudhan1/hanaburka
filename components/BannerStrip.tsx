import Reveal from "@/components/motion/Reveal";
import BannerStripClient from "@/components/BannerStripClient";
import { createClient } from "@/lib/supabase/server";

export default async function BannerStrip() {
  const supabase = createClient();
  const { data: banners } = await supabase
    .from("banners")
    .select("id, title, image_url, link_url")
    .eq("placement", "homepage")
    .eq("is_active", true)
    .order("sort_order");

  if (!banners || banners.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <Reveal>
        <BannerStripClient banners={banners} />
      </Reveal>
    </section>
  );
}
