"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
};

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setUser({
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name,
    });

    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        <h1 className="mb-10 text-5xl font-light">
          My Account
        </h1>

        <div className="rounded-[32px] bg-white p-10 shadow">

          <div className="space-y-5">

            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>

              <h2 className="text-2xl">
                {user?.full_name || "Customer"}
              </h2>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <h2 className="text-xl">
                {user?.email}
              </h2>
            </div>

          </div>

          <div className="mt-12 flex flex-wrap gap-4">

            <Link
              href="/wishlist"
              className="rounded-full border px-6 py-3"
            >
              My Wishlist
            </Link>

            <Link
              href="/orders"
              className="rounded-full border px-6 py-3"
            >
              My Orders
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full bg-black px-6 py-3 text-white"
            >
              Logout
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}