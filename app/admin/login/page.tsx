"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { adminSignIn } from "@/lib/actions/admin-auth";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    onTurnstileVerify?: (token: string) => void;
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    // React 18 ref callbacks don't support a cleanup return (that's a
    // React 19 feature) — a plain useEffect is the correct place for
    // this listener regardless of which DOM node the widget script
    // ends up attaching itself to.
    function handler(e: Event) {
      setCaptchaToken((e as CustomEvent).detail);
    }
    window.addEventListener("turnstile-verified", handler);
    return () => window.removeEventListener("turnstile-verified", handler);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await adminSignIn(email, password, captchaToken);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-6">
      {TURNSTILE_SITE_KEY && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <script
            // Turnstile's declarative widget calls this by name from the
            // global scope once the visitor completes the challenge —
            // simplest reliable way to get the token back into React
            // without fighting the widget's own script-injected DOM.
            dangerouslySetInnerHTML={{
              __html: `window.onTurnstileVerify = function(token) { window.dispatchEvent(new CustomEvent('turnstile-verified', { detail: token })); };`,
            }}
          />
        </>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-ivory p-8">
        <h1 className="font-display text-2xl text-espresso mb-1">HANA BURKA</h1>
        <p className="text-sm text-charcoal/60 mb-6">Admin Sign In</p>

        <div className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm"
          />
        </div>

        {TURNSTILE_SITE_KEY && (
          <div
            className="cf-turnstile mt-4"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-callback="onTurnstileVerify"
          />
        )}

        {error && <p className="text-rose text-sm mt-3">{error}</p>}

        <button
          type="submit"
          disabled={isPending || (!!TURNSTILE_SITE_KEY && !captchaToken)}
          className="w-full bg-espresso text-ivory py-3 text-sm tracking-wide mt-6 disabled:opacity-50"
        >
          {isPending ? "Signing in..." : "SIGN IN"}
        </button>
      </form>
    </div>
  );
}
