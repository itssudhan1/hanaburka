import Link from "next/link";
import Navbar from "@/components/Navbar";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import Footer from "@/components/Footer";
import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Navbar />
        <AuthCard title="Account" subtitle="Sign in to view your orders, addresses and account details.">
          <LoginForm redirectTo="/account" />
        </AuthCard>
        <Footer />
      </>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-3xl mb-2">
          {profile?.full_name ? `Hi, ${profile.full_name}` : "Your Account"}
        </h1>
        <p className="text-charcoal/60 text-sm mb-10">{user.email}</p>

        <div className="space-y-4">
          <Link href="/account/orders" className="block border border-mocha/15 p-4 hover:border-mocha/40 transition-colors">
            Orders
          </Link>
          <Link href="/wishlist" className="block border border-mocha/15 p-4 hover:border-mocha/40 transition-colors">
            Wishlist
          </Link>
          <Link href="/cart" className="block border border-mocha/15 p-4 hover:border-mocha/40 transition-colors">
            Bag
          </Link>
        </div>

        <div className="mt-10">
          <LogoutButton />
        </div>
      </div>
      <Footer />
    </>
  );
}
