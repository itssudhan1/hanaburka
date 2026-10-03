"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, full_name: name });
      await supabase.from("wishlists").upsert({ user_id: data.user.id }, { onConflict: "user_id" });
    }

    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <p className="max-w-sm text-charcoal/80">
        Check your email to confirm your account, then{" "}
        <Link href="/login" className="text-rose underline">
          sign in
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm text-charcoal/70 mb-1">
          Full name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-mocha/30 bg-white/60 px-4 py-3 text-sm text-[#160F0C] focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose/40 transition-colors"
        />
      </div>
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
          minLength={8}
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
        {loading ? "Creating account..." : "CREATE ACCOUNT"}
      </button>

      <p className="text-sm text-charcoal/70">
        Already have an account?{" "}
        <Link href="/login" className="text-rose underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
