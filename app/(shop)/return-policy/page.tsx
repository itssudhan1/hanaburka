import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPageContent } from "@/lib/config";
import { PAGE_DEFAULTS } from "@/lib/page-defaults";

export default async function ReturnPolicyPage() {
  const d = PAGE_DEFAULTS["return-policy"];
  const { title, body } = await getPageContent("return-policy", d.title, d.body);

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl mb-6">{title}</h1>
        <div className="space-y-4 text-charcoal/80 leading-relaxed text-sm">
          {body.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </div>
      <Footer />
    </>
  );
}
