import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CollectionPage({
  params,
}: Props) {
  const { category } = await params;

  // Find category using slug
  const {
    data: categoryData,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", category)
    .single();

  if (categoryError || !categoryData) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-4xl font-light">
          Collection Not Found
        </h1>
      </main>
    );
  }

  // Load products in this category
  const {
    data: products,
    error,
  } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      slug,
      created_at
    `)
    .eq("category_id", categoryData.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <h1 className="text-3xl font-light">
          Failed to load products
        </h1>
      </main>
    );
  }

  // Load product images
  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, image_url");

  const formattedProducts =
    products?.map((product) => {
      const firstImage = images?.find(
        (img) =>
          img.product_id === product.id
      );

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        image:
          firstImage?.image_url ??
          "/images/placeholder.png",
      };
    }) ?? [];

  return (
    <main className="min-h-screen bg-white py-20">

      <h1 className="mb-16 text-center text-5xl font-light">
        {categoryData.name}
      </h1>

      {formattedProducts.length === 0 ? (
        <p className="text-center text-gray-500">
          No products in this collection yet.
        </p>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:px-8">

          {formattedProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                slug={product.slug}
              />
            )
          )}

        </div>
      )}

    </main>
  );
}