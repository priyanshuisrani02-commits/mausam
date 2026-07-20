"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const menu = [
  { title: "Dashboard", href: "/admin", icon: "📊" },
  { title: "Products", href: "/admin/products", icon: "📦" },
  { title: "Categories", href: "/admin/categories", icon: "🏷️" },
  { title: "Homepage", href: "/admin/homepage", icon: "🖼️" },
  { title: "Orders", href: "/admin/orders", icon: "📑" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Failed to log out: " + error.message);
      return;
    }

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex min-h-screen w-72 flex-col bg-black p-8 text-white">
      <h1 className="mb-12 text-3xl font-light tracking-[6px]">
        MAUSAM
      </h1>

      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname.startsWith(item.href) &&
              item.href !== "/admin"
                ? "bg-white text-black"
                : pathname === "/admin" &&
                    item.href === "/admin"
                  ? "bg-white text-black"
                  : "hover:bg-white/10"
            }`}
          >
            {item.icon} {item.title}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-white/20 px-4 py-3 text-left transition hover:bg-white hover:text-black"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}