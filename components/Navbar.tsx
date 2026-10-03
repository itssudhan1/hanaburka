import { createClient } from "@/lib/supabase/server";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cartCount = 0;
  if (user) {
    const { count } = await supabase
      .from("cart_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("saved_for_later", false);
    cartCount = count ?? 0;
  }

  return <NavbarClient cartCount={cartCount} />;
}
