import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  // Only allow internal paths through, so ?redirect= can't be used to bounce
  // someone to an external site after they sign in.
  const raw = searchParams?.redirect ?? "";
  const redirectTo = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";

  return (
    <>
      <Navbar />
      <AuthCard
        title="Sign In"
        subtitle="Sign in to view your account, orders and wishlist."
      >
        <LoginForm redirectTo={redirectTo} />
      </AuthCard>
      <Footer />
    </>
  );
}
