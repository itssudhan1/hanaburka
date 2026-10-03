import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl mb-4">Page not found</h1>
        <p className="text-charcoal/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
      <Footer />
    </>
  );
}
