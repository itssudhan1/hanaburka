"use client";

import Image from "next/image";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadHomepageMedia } from "@/lib/actions/upload";
import { createBanner, toggleBanner, deleteBanner } from "@/lib/actions/banners";

export default function BannerManager({ banners }: { banners: any[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const url = await uploadHomepageMedia(formData);
        await createBanner({
          title: title || undefined,
          image_url: url,
          link_url: linkUrl || undefined,
          placement: "homepage",
          sort_order: banners.length,
        });
        setTitle("");
        setLinkUrl("");
        router.refresh();
      } catch (err: any) {
        setError(err.message ?? "Upload failed");
      } finally {
        if (fileInput.current) fileInput.current.value = "";
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-8">
        {banners.map((b) => (
          <div key={b.id} className="w-40">
            <Image src={b.image_url} alt={b.title ?? ""} width={320} height={96} className="w-full h-24 object-cover mb-2" />
            <p className="text-xs text-charcoal/60 truncate">{b.title || "Untitled"}</p>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => startTransition(async () => { await toggleBanner(b.id, !b.is_active); router.refresh(); })}
                className={b.is_active ? "text-mocha" : "text-charcoal/40"}
              >
                {b.is_active ? "Active" : "Inactive"}
              </button>
              <button
                onClick={() => { if (confirm("Delete this banner?")) startTransition(async () => { await deleteBanner(b.id); router.refresh(); }); }}
                className="text-rose underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg text-espresso mb-3">Add Banner</h2>
      {error && <p className="text-rose text-sm mb-2">{error}</p>}
      <div className="space-y-2 max-w-sm mb-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full border border-mocha/30 px-3 py-2 text-sm" />
        <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Link URL (optional)" className="w-full border border-mocha/30 px-3 py-2 text-sm" />
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={isPending} className="text-sm" />
      </div>
      {isPending && <p className="text-sm text-charcoal/50">Uploading...</p>}
    </div>
  );
}
