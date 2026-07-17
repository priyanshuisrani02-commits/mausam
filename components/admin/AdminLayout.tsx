import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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