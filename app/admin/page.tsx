import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminPage() {
  return (
    <AdminLayout>

      <h1 className="mb-10 text-5xl font-light text-black">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="rounded-[28px] bg-white p-8 shadow">
          <p className="text-gray-500">Products</p>
          <h2 className="mt-2 text-4xl">24</h2>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow">
          <p className="text-gray-500">Orders</p>
          <h2 className="mt-2 text-4xl">0</h2>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow">
          <p className="text-gray-500">Revenue</p>
          <h2 className="mt-2 text-4xl">₹0</h2>
        </div>

        <div className="rounded-[28px] bg-white p-8 shadow">
          <p className="text-gray-500">Customers</p>
          <h2 className="mt-2 text-4xl">0</h2>
        </div>

      </div>

      <div className="mt-12 rounded-[28px] bg-white p-8 shadow">

        <h2 className="mb-6 text-3xl">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">

          <Link
            href="/admin/products/new"
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Add Product
          </Link>

          <Link
            href="/admin/categories"
            className="rounded-full border px-6 py-3"
          >
            Categories
          </Link>

          <Link
            href="/admin/homepage"
            className="rounded-full border px-6 py-3"
          >
            Homepage
          </Link>

        </div>

      </div>

    </AdminLayout>
  );
}
