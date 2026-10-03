"use client";

import Image from "next/image";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCollection, updateCollection, deleteCollection } from "@/lib/actions/collections";
import { uploadCollectionImage } from "@/lib/actions/upload";

type Collection = { id: string; name: string; slug: string; image_url: string | null };

function CollectionImageCell({ collection }: { collection: Collection }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const url = await uploadCollectionImage(formData);
        await updateCollection(collection.id, { image_url: url });
        router.refresh();
      } catch (err: any) {
        setError(err.message ?? "Upload failed");
      } finally {
        if (fileInput.current) fileInput.current.value = "";
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      {collection.image_url ? (
        <Image src={collection.image_url} alt="" width={48} height={48} className="w-12 h-12 object-cover" />
      ) : (
        <div className="w-12 h-12 bg-mocha/10 flex items-center justify-center text-[9px] text-mocha/40">
          None
        </div>
      )}
      <div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={isPending}
          className="text-xs w-32"
        />
        {error && <p className="text-rose text-xs">{error}</p>}
      </div>
    </div>
  );
}

export default function CollectionManager({ collections }: { collections: Collection[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="border border-mocha/15 bg-white mb-6 overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-b border-mocha/10">
                <td className="p-3"><CollectionImageCell collection={c} /></td>
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-charcoal/50">{c.slug}</td>
                <td className="p-3">
                  <button
                    onClick={() => {
                      if (!confirm(`Delete "${c.name}"?`)) return;
                      startTransition(async () => {
                        await deleteCollection(c.id);
                        router.refresh();
                      });
                    }}
                    className="text-rose underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg text-espresso mb-3">Add Collection</h2>
      {error && <p className="text-rose text-sm mb-2">{error}</p>}
      <div className="flex gap-2 max-w-md">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
          }}
          placeholder="Name"
          className="flex-1 border border-mocha/30 px-3 py-2 text-sm"
        />
        <button
          disabled={isPending || !name}
          onClick={() =>
            startTransition(async () => {
              try {
                await createCollection({ name, slug, sort_order: collections.length, is_published: true });
                setName("");
                setSlug("");
                router.refresh();
              } catch (err: any) {
                setError(err.message ?? "Could not add collection");
              }
            })
          }
          className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <p className="text-xs text-charcoal/50 mt-3">
        Upload an image directly next to each collection above.
      </p>
    </div>
  );
}
