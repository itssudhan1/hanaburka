import Reveal from "@/components/motion/Reveal";
import { createClient } from "@/lib/supabase/server";

async function subscribe(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;

  const supabase = createClient();
  await supabase.from("newsletter_subscribers").insert({ email });
}

export default async function Newsletter() {
  const supabase = createClient();
  const { data } = await supabase
    .from("homepage_sections")
    .select("content")
    .eq("section_key", "newsletter")
    .single();

  const content = (data?.content ?? {}) as {
    heading?: string;
    subheading?: string;
  };

  return (
    <section className="max-w-2xl mx-auto px-6 py-20 text-center">
      <Reveal>
        <h2 className="text-3xl mb-3">
          {content.heading ?? "Join the Hana Burka circle"}
        </h2>
        {content.subheading && (
          <p className="text-charcoal/70 mb-8">{content.subheading}</p>
        )}
        <form action={subscribe} className="flex gap-2 max-w-md mx-auto">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            required
            placeholder="Your email"
            className="flex-1 border border-mocha/30 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-rose transition-colors"
          />
          <button
            type="submit"
            className="bg-espresso text-ivory px-6 py-3 text-sm tracking-wide hover:bg-charcoal transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            Subscribe
          </button>
        </form>
      </Reveal>
    </section>
  );
}
