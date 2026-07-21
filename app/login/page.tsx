"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6">
      <div className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-xl">

        <Link
          href="/"
          className="mb-10 block text-center text-4xl font-light tracking-[10px]"
        >
          MAUSAM
        </Link>

        <h1 className="mb-8 text-center text-3xl font-light">
          Welcome Back
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-4 text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <div className="mt-8 space-y-3 text-center text-sm">
          <Link
            href="/forgot-password"
            className="block text-gray-600 hover:text-black"
          >
            Forgot Password?
          </Link>

          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-black hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}