"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ redirectTo = "/account" }: { redirectTo?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm text-charcoal/70 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-mocha/30 bg-white/60 px-4 py-3 text-sm text-[#160F0C] focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose/40 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-charcoal/70 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-mocha/30 bg-white/60 px-4 py-3 text-sm text-[#160F0C] focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose/40 transition-colors"
        />
      </div>

      {error && <p className="text-rose text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-espresso text-ivory py-3 text-sm tracking-wide hover:bg-charcoal transition-colors disabled:opacity-50"
      >
        {loading ? "Signing in..." : "SIGN IN"}
      </button>

      <p className="text-sm text-charcoal/70 text-center pt-1">
        New here?{" "}
        <Link href="/register" className="text-rose underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
