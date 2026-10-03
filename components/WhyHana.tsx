import StaggerGroup from "@/components/motion/StaggerGroup";
import { createClient } from "@/lib/supabase/server";

type WhyHanaContent = {
  cards?: { title: string; description?: string }[];
};

export default async function WhyHana() {
  const supabase = createClient();
  const { data } = await supabase
    .from("homepage_sections")
    .select("content")
    .eq("section_key", "why_hana")
    .single();

  const cards = ((data?.content as WhyHanaContent)?.cards ?? []).filter(
    (c) => c.title
  );
  if (!cards.length) return null;

  return (
    <section className="bg-espresso text-ivory">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="divider-gold mb-12" />
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {cards.map((card) => (
            <div key={card.title}>
              <h3 className="text-xl mb-2 text-gold">{card.title}</h3>
              {card.description && (
                <p className="text-ivory/70 text-sm leading-relaxed">
                  {card.description}
                </p>
              )}
            </div>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
