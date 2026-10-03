"use client";

import { useState, useTransition } from "react";
import { setPageContent } from "@/lib/actions/admin-settings";

export default function PageContentEditor({
  slug,
  initialTitle,
  initialBody,
}: {
  slug: string;
  initialTitle: string;
  initialBody: string;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-2xl border border-mocha/15 bg-white p-5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Page title"
        className="w-full border border-mocha/30 px-3 py-2 text-sm mb-3"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Page content"
        rows={10}
        className="w-full border border-mocha/30 px-3 py-2 text-sm mb-3 font-body"
      />
      <p className="text-xs text-charcoal/50 mb-3">
        Leave a blank line between paragraphs — they&apos;ll render as separate
        paragraphs on the page.
      </p>
      {error && <p className="text-rose text-sm mb-2">{error}</p>}
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await setPageContent(slug, title, body);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            } catch (err: any) {
              setError(err.message ?? "Could not save");
            }
          })
        }
        className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
      >
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
