import CouponManager from "@/components/admin/CouponManager";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Coupons</h1>
      <CouponManager coupons={coupons ?? []} />
      <p className="text-xs text-charcoal/50 mt-6 max-w-md">
        Product-specific and category-specific coupon restrictions aren&apos;t
        exposed in this form yet (the database supports them — see
        `coupons.product_id`/`category_id`), only global, first-order-only,
        and customer-specific (set directly in Supabase) restrictions.
      </p>
    </div>
  );
}
