import ReviewModerationList from "@/components/admin/ReviewModerationList";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminReviewsPage() {
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, title, body, created_at, product:products(name)")
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Reviews</h1>
      <ReviewModerationList reviews={reviews ?? []} />
    </div>
  );
}
