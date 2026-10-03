import { createClient } from "@/lib/supabase/server";
import Marquee from "@/components/motion/Marquee";

type AnnouncementContent = {
  text?: string; // legacy single-message field, kept for backward compatibility
  messages?: string[];
};

export default async function AnnouncementBar() {
  const supabase = createClient();
  const { data } = await supabase
    .from("homepage_sections")
    .select("content, is_active")
    .eq("section_key", "announcement_bar")
    .single();

  if (!data || !data.is_active) return null;

  const content = (data.content as AnnouncementContent) ?? {};
  const messages = content.messages?.length
    ? content.messages
    : content.text
    ? [content.text]
    : [];

  if (messages.length === 0) return null;

  return (
    <div className="bg-espresso text-ivory">
      <Marquee messages={messages} />
    </div>
  );
}
