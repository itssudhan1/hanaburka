"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-3xl mb-6">Set New Password</h1>

      {done ? (
        <div>
          <p className="text-mocha mb-4">Password updated.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-espresso text-ivory px-6 py-3 text-sm tracking-wide"
          >
            Go to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-mocha/30 bg-transparent px-4 py-3 text-sm"
          />
          {error && <p className="text-rose text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-espresso text-ivory py-3 text-sm tracking-wide disabled:opacity-50"
          >
            {loading ? "Updating..." : "UPDATE PASSWORD"}
          </button>
        </form>
      )}
    </div>
  );
}
