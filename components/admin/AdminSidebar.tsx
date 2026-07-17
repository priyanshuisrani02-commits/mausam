"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { title: "Dashboard", href: "/admin", icon: "📊" },
  { title: "Products", href: "/admin/products", icon: "📦" },
  { title: "Categories", href: "/admin/categories", icon: "🏷️" },
  { title: "Homepage", href: "/admin/homepage", icon: "🖼️" },
  { title: "Orders", href: "/admin/orders", icon: "📑" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 min-h-screen bg-black text-white p-8">

      <h1 className="mb-12 text-3xl font-light tracking-[6px]">
        MAUSAM
      </h1>

      <nav className="space-y-2">

        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl px-4 py-3 transition ${
              pathname.startsWith(item.href) && item.href !== "/admin"
                ? "bg-white text-black"
                : pathname === "/admin" && item.href === "/admin"
                ? "bg-white text-black"
                : "hover:bg-white/10"
            }`}
          >
            {item.icon} {item.title}
          </Link>
        ))}

      </nav>

    </aside>
  );
}