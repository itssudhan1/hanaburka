import Image from "next/image";

/**
 * The card shell every signed-out screen shares. Used on /login and
 * /register, and inlined on /account, /wishlist and /account/orders so a
 * signed-out visitor gets the actual sign-in form right where they landed
 * instead of a bare "SIGN IN" link that bounces them somewhere else.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto px-5 py-14 sm:py-20">
      <div className="bg-white/70 backdrop-blur-sm border border-mocha/20 shadow-[0_18px_50px_-24px_rgba(36,28,24,0.45)] px-6 sm:px-9 py-9 sm:py-11">
        <div className="flex flex-col items-center text-center mb-8">
          <Image
            src="/logo.png"
            alt="Hana Burka"
            width={36}
            height={54}
            className="h-10 w-auto mb-3"
          />
          <span className="font-display text-xl tracking-[0.18em] text-[#160F0C] font-semibold">
            HANA BURKA
          </span>
          <div className="h-px w-12 bg-gold my-5" />
          <h1 className="font-display text-3xl text-[#160F0C]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-charcoal/70 mt-2 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
