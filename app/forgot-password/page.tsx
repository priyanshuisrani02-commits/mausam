"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            window.location.origin +
            "/reset-password",
        }
      );

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Password reset email sent. Please check your inbox."
    );
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
          Reset Password
        </h1>

        <form
          onSubmit={handleReset}
          className="space-y-5"
        >
          <input
            type="email"
            required
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-4 text-white"
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm hover:underline"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </main>
  );
}