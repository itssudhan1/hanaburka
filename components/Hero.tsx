import { createClient } from "@/lib/supabase/server";
import HeroMotion from "@/components/HeroMotion";

type HeroContent = {
  heading?: string;
  description?: string;
  image_url?: string;
  primary_button?: { label: string; href: string };
  secondary_button?: { label: string; href: string };
};

export default async function Hero() {
  const supabase = createClient();
  const { data } = await supabase
    .from("homepage_sections")
    .select("content")
    .eq("section_key", "hero")
    .single();

  const content = (data?.content ?? {}) as HeroContent;

  return <HeroMotion content={content} />;
}
