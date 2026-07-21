"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function AccountMenu() {
  const { user, loading } = useAuth();

  const router = useRouter();

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    setOpen(false);

    router.push("/");

    router.refresh();
  }

  if (loading) {
    return (
      <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="hover:underline"
      >
        Account
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Account";

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        onClick={() => setOpen(!open)}
        className="hover:underline"
      >
        {displayName} ▾
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-60 rounded-2xl border bg-white p-2 shadow-xl">

          <div className="border-b px-4 py-3">

            <p className="font-medium">
              {displayName}
            </p>

            <p className="text-sm text-gray-500">
              {user.email}
            </p>

          </div>

          <Link
            href="/account"
            className="block rounded-xl px-4 py-3 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            👤 My Account
          </Link>

          <Link
            href="/wishlist"
            className="block rounded-xl px-4 py-3 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            ❤️ Wishlist
          </Link>

          <Link
            href="/orders"
            className="block rounded-xl px-4 py-3 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            📦 Orders
          </Link>

          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50"
          >
            🚪 Logout
          </button>

        </div>
      )}
    </div>
  );
}