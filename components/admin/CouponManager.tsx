"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCoupon, toggleCoupon, deleteCoupon } from "@/lib/actions/coupons";

export default function CouponManager({ coupons }: { coupons: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "", type: "percentage", value: "", min_order_amount: "",
    max_discount_amount: "", usage_limit: "", first_order_only: false,
  });

  return (
    <div>
      <div className="border border-mocha/15 bg-white mb-8 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-charcoal/50 border-b border-mocha/15">
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-mocha/10">
                <td className="p-3">{c.code}</td>
                <td className="p-3 capitalize">{c.type}</td>
                <td className="p-3">{c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-3">
                  <button
                    onClick={() => startTransition(async () => { await toggleCoupon(c.id, !c.is_active); router.refresh(); })}
                    className={c.is_active ? "text-mocha" : "text-charcoal/40"}
                  >
                    {c.is_active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => { if (confirm(`Delete ${c.code}?`)) startTransition(async () => { await deleteCoupon(c.id); router.refresh(); }); }}
                    className="text-rose underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={5} className="p-5 text-charcoal/50">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg text-espresso mb-3">Add Coupon</h2>
      {error && <p className="text-rose text-sm mb-2">{error}</p>}
      <div className="grid grid-cols-2 gap-2 max-w-md mb-3">
        <input placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="border border-mocha/30 px-3 py-2 text-sm" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-mocha/30 px-3 py-2 text-sm">
          <option value="percentage">Percentage</option>
          <option value="flat">Flat</option>
        </select>
        <input placeholder="Value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="border border-mocha/30 px-3 py-2 text-sm" />
        <input placeholder="Min order (optional)" type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="border border-mocha/30 px-3 py-2 text-sm" />
        <input placeholder="Max discount (optional)" type="number" value={form.max_discount_amount} onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })} className="border border-mocha/30 px-3 py-2 text-sm" />
        <input placeholder="Usage limit (optional)" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="border border-mocha/30 px-3 py-2 text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm mb-3">
        <input type="checkbox" checked={form.first_order_only} onChange={(e) => setForm({ ...form, first_order_only: e.target.checked })} />
        First order only
      </label>
      <button
        disabled={isPending || !form.code || !form.value}
        onClick={() =>
          startTransition(async () => {
            try {
              await createCoupon({
                code: form.code,
                type: form.type as "percentage" | "flat",
                value: Number(form.value),
                min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined,
                max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : undefined,
                usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined,
                first_order_only: form.first_order_only,
                is_active: true,
              });
              setForm({ code: "", type: "percentage", value: "", min_order_amount: "", max_discount_amount: "", usage_limit: "", first_order_only: false });
              router.refresh();
            } catch (err: any) {
              setError(err.message ?? "Could not create coupon");
            }
          })
        }
        className="bg-espresso text-ivory px-4 py-2 text-sm disabled:opacity-40"
      >
        Add Coupon
      </button>
    </div>
  );
}
