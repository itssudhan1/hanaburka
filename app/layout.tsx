import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hanaburka.com"), // update once the domain is live
  title: {
    default: "HANA BURKA — Elegance in Modesty",
    template: "%s",
  },
  description:
    "Discover beautifully crafted burkas designed for comfort, confidence and everyday elegance.",
  openGraph: {
    title: "HANA BURKA — Elegance in Modesty",
    description:
      "Discover beautifully crafted burkas designed for comfort, confidence and everyday elegance.",
    type: "website",
    siteName: "HANA BURKA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-espresso focus:text-ivory focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
