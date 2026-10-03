"use client";

import { useState, useTransition } from "react";
import { setCustomerCareLinks } from "@/lib/actions/admin-settings";

type LinkRow = { label: string; url: string };

export default function CustomerCareLinksManager({ links }: { links: LinkRow[] }) {
  const [rows, setRows] = useState<LinkRow[]>(links.length ? links : [{ label: "", url: "" }]);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(i: number, field: keyof LinkRow, value: string) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }
  function removeRow(i: number) {
    setRows(rows.filter((_, idx) => idx !== i));
  }
  function moveRow(i: number, dir: -1 | 1) {
    const next = [...rows];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    setRows(next);
  }

  return (
    <div className="max-w-lg">
      <p className="text-xs text-charcoal/50 mb-3">
        Controls the &quot;Customer Care&quot; column in the site footer — label and
        link for each item, in the order shown here. Use a relative path
        (e.g. <code>/contact</code>) for pages on this site, or a full
        https:// URL for an external link.
      </p>
      <div className="space-y-2 mb-3">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={row.label}
              onChange={(e) => updateRow(i, "label", e.target.value)}
              placeholder="Label (e.g. Shipping)"
              className="flex-1 border border-mocha/30 px-3 py-2 text-sm"
            />
            <input
              value={row.url}
              onChange={(e) => updateRow(i, "url", e.target.value)}
              placeholder="/shipping-policy"
              className="flex-1 border border-mocha/30 px-3 py-2 text-sm"
            />
            <button type="button" onClick={() => moveRow(i, -1)} disabled={i === 0} className="text-charcoal/50 disabled:opacity-20 px-1">
              ↑
            </button>
            <button type="button" onClick={() => moveRow(i, 1)} disabled={i === rows.length - 1} className="text-charcoal/50 disabled:opacity-20 px-1">
              ↓
            </button>
            <button type="button" onClick={() => removeRow(i)} className="text-rose text-sm px-1">
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows([...rows, { label: "", url: "" }])}
        className="text-sm underline text-charcoal/70 mb-4 block"
      >
        + Add link
      </button>

      {error && <p className="text-rose text-sm mb-2">{error}</p>}
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              const clean = rows.filter((r) => r.label.trim() && r.url.trim());
              await setCustomerCareLinks(clean);
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
