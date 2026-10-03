import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <AuthCard
        title="Create Account"
        subtitle="Save your wishlist and track every order in one place."
      >
        <RegisterForm />
      </AuthCard>
      <Footer />
    </>
  );
}
