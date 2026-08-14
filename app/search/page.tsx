import Link from "next/link";
import { getStoreProducts, type StoreProduct } from "@/lib/store-products";
import Footer from "@/components/Footer";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const products = await getStoreProducts();

  const results = products.filter((product: StoreProduct) =>
    product.name.toLowerCase().includes(query)
  );

  return (
    <main className="min-h-screen bg-white px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-3 text-5xl font-light text-black">Search Results</h1>
        <p className="mb-10 text-gray-500">
          Showing results for <span className="font-medium text-black">"{q}"</span>
        </p>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 p-12 text-center">
            <h2 className="mb-3 text-2xl font-light text-black">No products found</h2>
            <p className="text-gray-500">Try searching with another keyword.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="overflow-hidden rounded-3xl border transition hover:shadow-xl">
                <img src={product.image} alt={product.name} className="h-80 w-full object-cover" />
                <div className="p-6">
                  <h2 className="text-2xl font-light text-black">{product.name}</h2>
                  <p className="mt-3 text-xl font-semibold text-black">
                    ₹{(product.sale_price ?? product.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
