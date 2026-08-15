"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(
    pathname !== "/admin/login"
  );

  useEffect(() => {
    if (pathname === "/admin/login") {
      setCheckingAccess(false);
      return;
    }

    let mounted = true;
    const supabase = createClient();

    async function checkAdminAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          router.replace("/admin/login");
        }
        return;
      }

      const { data: isAdmin, error } = await supabase.rpc(
        "is_mausam_admin"
      );

      if (error || isAdmin !== true) {
        await supabase.auth.signOut();

        if (mounted) {
          router.replace("/admin/login");
        }
        return;
      }

      if (mounted) {
        setCheckingAccess(false);
      }
    }

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checkingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <p className="text-gray-500">
          Checking admin access...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="flex">
        <AdminSidebar />

        <section className="flex-1 p-10">
          {children}
        </section>
      </div>
    </main>
  );
}