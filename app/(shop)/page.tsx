import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryGrid from "@/components/CategoryGrid";
import ProductRail from "@/components/ProductRail";
import BannerStrip from "@/components/BannerStrip";
import WhyHana from "@/components/WhyHana";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <main id="main-content">
        <CategoryGrid />
        {/* Each rail hides itself automatically when no product is marked
            featured/bestseller/new-arrival in admin — nothing is faked
            with placeholder products. */}
        <ProductRail title="Featured" filterColumn="is_featured" viewAllHref="/shop" />
        <BannerStrip />
        <ProductRail title="New Arrivals" filterColumn="is_new_arrival" viewAllHref="/new-arrivals" />
        <ProductRail title="Best Sellers" filterColumn="is_bestseller" viewAllHref="/shop" />
        <WhyHana />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
