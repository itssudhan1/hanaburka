import Link from "next/link";

const PAGES = [
  { slug: "about", label: "About" },
  { slug: "shipping-policy", label: "Shipping Policy" },
  { slug: "return-policy", label: "Return Policy" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms", label: "Terms of Service" },
];

export default function AdminPagesList() {
  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Pages</h1>
      <p className="text-sm text-charcoal/60 mb-6 max-w-lg">
        Edit the title and body text customers see on each of these pages.
        Contact page details (address/phone) are under Settings → Business
        Info instead.
      </p>
      <div className="border border-mocha/15 bg-white max-w-md">
        {PAGES.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/pages/${p.slug}`}
            className="block p-4 border-b border-mocha/10 last:border-b-0 hover:bg-ivory text-espresso underline"
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
