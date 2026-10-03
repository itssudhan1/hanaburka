"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { updateHomepageSection } from "@/lib/actions/homepage";
import { uploadHomepageMedia } from "@/lib/actions/upload";

export default function HomepageEditor({
  announcement,
  hero,
  whyHana,
  newsletter,
}: {
  announcement: { text?: string; messages?: string[]; is_active?: boolean };
  hero: {
    heading?: string;
    description?: string;
    image_url?: string;
    images?: string[];
    primary_button?: { label: string; href: string };
    secondary_button?: { label: string; href: string };
  };
  whyHana: { cards?: { title: string; description?: string }[] };
  newsletter: { heading?: string; subheading?: string };
}) {
  const [announcementMessages, setAnnouncementMessages] = useState<string[]>(
    announcement.messages?.length
      ? announcement.messages
      : announcement.text
      ? [announcement.text]
      : [""]
  );
  const [announcementActive, setAnnouncementActive] = useState(announcement.is_active ?? true);
  const [heroHeading, setHeroHeading] = useState(hero.heading ?? "");
  const [heroDescription, setHeroDescription] = useState(hero.description ?? "");
  const [heroImages, setHeroImages] = useState<string[]>(
    hero.images?.length ? hero.images : hero.image_url ? [hero.image_url] : []
  );
  const [cards, setCards] = useState(
    whyHana.cards?.length
      ? whyHana.cards
      : [{ title: "", description: "" }, { title: "", description: "" }, { title: "", description: "" }, { title: "", description: "" }]
  );
  const [newsletterHeading, setNewsletterHeading] = useState(newsletter.heading ?? "");
  const [newsletterSubheading, setNewsletterSubheading] = useState(newsletter.subheading ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const heroFileInput = useRef<HTMLInputElement>(null);

  function handleHeroImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const url = await uploadHomepageMedia(formData);
        setHeroImages((prev) => [...prev, url]);
      } catch (err: any) {
        setUploadError(err.message ?? "Upload failed");
      } finally {
        if (heroFileInput.current) heroFileInput.current.value = "";
      }
    });
  }

  function removeHeroImage(index: number) {
    setHeroImages((prev) => prev.filter((_, i) => i !== index));
  }

  function updateCard(i: number, field: "title" | "description", value: string) {
    setCards(cards.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  }

  return (
    <div className="space-y-10 max-w-xl">
      <div>
        <h2 className="text-lg text-espresso mb-3">Announcement Bar</h2>
        <p className="text-xs text-charcoal/50 mb-2">
          Each line scrolls continuously as a rotating marquee — add a few
          short messages.
        </p>
        <div className="space-y-2 mb-2">
          {announcementMessages.map((msg, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={msg}
                onChange={(e) =>
                  setAnnouncementMessages(
                    announcementMessages.map((m, idx) => (idx === i ? e.target.value : m))
                  )
                }
                className="flex-1 border border-mocha/30 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setAnnouncementMessages(announcementMessages.filter((_, idx) => idx !== i))
                }
                className="text-rose text-sm px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAnnouncementMessages([...announcementMessages, ""])}
          className="text-sm underline text-charcoal/70 mb-3"
        >
          + Add message
        </button>
        <label className="flex items-center gap-2 text-sm mb-3">
          <input
            type="checkbox"
            checked={announcementActive}
            onChange={(e) => setAnnouncementActive(e.target.checked)}
          />
          Show announcement bar
        </label>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateHomepageSection("announcement_bar", {
                messages: announcementMessages.filter((m) => m.trim()),
                is_active: announcementActive,
              });
              setSaved("announcement");
              setTimeout(() => setSaved(null), 2000);
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          {saved === "announcement" ? "Saved" : "Save"}
        </button>
      </div>

      <div>
        <h2 className="text-lg text-espresso mb-3">Hero Section</h2>
        <input
          value={heroHeading}
          onChange={(e) => setHeroHeading(e.target.value)}
          placeholder="Heading"
          className="w-full border border-mocha/30 px-3 py-2 text-sm mb-2"
        />
        <textarea
          value={heroDescription}
          onChange={(e) => setHeroDescription(e.target.value)}
          placeholder="Description"
          className="w-full border border-mocha/30 px-3 py-2 text-sm mb-2"
          rows={3}
        />
        {heroImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {heroImages.map((url, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image src={url} alt={`Hero slide ${i + 1}`} width={112} height={80} className="w-28 h-20 object-cover" />
                <button
                  type="button"
                  onClick={() => removeHeroImage(i)}
                  className="absolute -top-1.5 -right-1.5 bg-rose text-ivory w-5 h-5 rounded-full text-xs leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-charcoal/50 mb-2">
          Add one image for a static hero, or several for an auto-sliding
          hero (rotates every 5 seconds).
        </p>
        <input
          ref={heroFileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleHeroImageUpload}
          disabled={isPending}
          className="text-sm mb-3 block"
        />
        {uploadError && <p className="text-rose text-sm mb-2">{uploadError}</p>}
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateHomepageSection("hero", {
                ...hero,
                heading: heroHeading,
                description: heroDescription,
                images: heroImages,
              });
              setSaved("hero");
              setTimeout(() => setSaved(null), 2000);
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          {saved === "hero" ? "Saved" : "Save"}
        </button>
      </div>

      <div>
        <h2 className="text-lg text-espresso mb-3">Why Hana Cards</h2>
        <div className="space-y-3 mb-3">
          {cards.map((c, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input
                value={c.title}
                onChange={(e) => updateCard(i, "title", e.target.value)}
                placeholder="Card title"
                className="border border-mocha/30 px-3 py-2 text-sm"
              />
              <input
                value={c.description ?? ""}
                onChange={(e) => updateCard(i, "description", e.target.value)}
                placeholder="Description"
                className="border border-mocha/30 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateHomepageSection("why_hana", { cards });
              setSaved("why_hana");
              setTimeout(() => setSaved(null), 2000);
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          {saved === "why_hana" ? "Saved" : "Save"}
        </button>
      </div>

      <div>
        <h2 className="text-lg text-espresso mb-3">Newsletter</h2>
        <input
          value={newsletterHeading}
          onChange={(e) => setNewsletterHeading(e.target.value)}
          placeholder="Heading"
          className="w-full border border-mocha/30 px-3 py-2 text-sm mb-2"
        />
        <input
          value={newsletterSubheading}
          onChange={(e) => setNewsletterSubheading(e.target.value)}
          placeholder="Subheading (optional)"
          className="w-full border border-mocha/30 px-3 py-2 text-sm mb-3"
        />
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await updateHomepageSection("newsletter", {
                heading: newsletterHeading,
                subheading: newsletterSubheading,
              });
              setSaved("newsletter");
              setTimeout(() => setSaved(null), 2000);
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          {saved === "newsletter" ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
