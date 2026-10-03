import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!adminRow || !adminRow.is_active) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar role={adminRow.role} />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="mt-16 md:mt-0">{children}</div>
      </main>
    </div>
  );
}
