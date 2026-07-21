"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignup(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Account created! Please check your email to verify your account."
    );

    router.push("/login");
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
          Create Account
        </h1>

        <form
          onSubmit={handleSignup}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
          />

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
            minLength={6}
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
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-black hover:underline"
          >
            Login
          </Link>
        </div>

      </div>
    </main>
  );
}