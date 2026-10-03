import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getWhatsAppNumber, buildWhatsAppLink, getBusinessInfo } from "@/lib/config";

export default async function ContactPage() {
  const [whatsappNumber, BUSINESS_INFO] = await Promise.all([
    getWhatsAppNumber(),
    getBusinessInfo(),
  ]);
  const whatsappHref = buildWhatsAppLink(whatsappNumber);

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-16">
        <h1 className="text-3xl mb-6">Contact Us</h1>
        <p className="text-charcoal/70 mb-8">
          Have a question about an order, sizing, or anything else? Reach
          out and we&apos;ll get back to you.
        </p>

        <div className="mb-8 text-sm text-charcoal/80 leading-relaxed">
          <p className="text-espresso mb-1">{BUSINESS_INFO.name}</p>
          <p>{BUSINESS_INFO.address}</p>
          <p className="mt-2">
            <a href={`tel:${BUSINESS_INFO.phone.replace(/\s/g, "")}`} className="hover:text-rose transition-colors">
              {BUSINESS_INFO.phone}
            </a>
            {" · "}
            <a href={`tel:${BUSINESS_INFO.phoneSecondary.replace(/\s/g, "")}`} className="hover:text-rose transition-colors">
              {BUSINESS_INFO.phoneSecondary}
            </a>
          </p>
        </div>

        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-espresso text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-all hover:scale-[1.02] active:scale-[0.98] mb-8"
          >
            MESSAGE US ON WHATSAPP
          </a>
        )}

        <p className="text-sm text-charcoal/50">
          Email and a contact form aren&apos;t wired up yet — WhatsApp and phone
          are the working contact methods on this page right now.
        </p>
      </div>
      <Footer />
    </>
  );
}
