"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: adminCheck, error: adminCheckError } =
      await supabase.rpc("is_mausam_admin");

    if (adminCheckError || adminCheck !== true) {
      await supabase.auth.signOut();
      setError(
        "This account is not authorized to access the MAUSAM admin panel."
      );
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f4ef] px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-xl">

        <h1 className="mb-2 text-center text-4xl font-light tracking-wide">
          MAUSAM
        </h1>

        <p className="mb-10 text-center text-gray-500">
          Admin Login
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-black"
            required
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-black"
            required
          />

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-4 text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}