import PageTransition from "@/components/motion/PageTransition";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { CartDrawerProvider } from "@/components/cart/CartDrawerContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { getWhatsAppNumber, buildWhatsAppLink } from "@/lib/config";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const whatsappNumber = await getWhatsAppNumber();
  const whatsappHref = buildWhatsAppLink(whatsappNumber, "Hi! I have a question.");

  return (
    <CartDrawerProvider>
      <PageTransition>{children}</PageTransition>
      <FloatingWhatsApp href={whatsappHref} />
      <CartDrawer />
    </CartDrawerProvider>
  );
}
