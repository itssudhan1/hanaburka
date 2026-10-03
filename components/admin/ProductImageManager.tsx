"use client";

import Image from "next/image";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadProductImage } from "@/lib/actions/upload";
import { addProductImage, deleteProductImage } from "@/lib/actions/products";

type Img = { id: string; url: string; is_primary: boolean };

export default function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: Img[];
}) {
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
        const url = await uploadProductImage(formData);
        await addProductImage(productId, url, { isPrimary: images.length === 0 });
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
      <div className="flex flex-wrap gap-3 mb-4">
        {images.map((img) => (
          <div key={img.id} className="relative w-24 h-28 border border-mocha/20">
            <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
            {img.is_primary && (
              <span className="absolute top-1 left-1 bg-gold text-espresso text-[10px] px-1">
                Primary
              </span>
            )}
            <button
              onClick={() =>
                startTransition(async () => {
                  await deleteProductImage(img.id);
                  router.refresh();
                })
              }
              className="absolute bottom-1 right-1 bg-rose text-ivory text-[10px] px-1"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={isPending}
        className="text-sm"
      />
      {error && <p className="text-rose text-sm mt-2">{error}</p>}
      {isPending && <p className="text-sm text-charcoal/50 mt-2">Uploading...</p>}
    </div>
  );
}
