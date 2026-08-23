import { supabase } from "./supabase";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  sale_price: number | string | null;
  category: string;
  category_id?: string | null;
  image: string;
  stock: number;
  stock_quantity?: number | null;
  description: string;
  featured: boolean;
  new_arrival?: boolean;
  track_inventory?: boolean | null;
  low_stock_threshold?: number | null;
};

export async function getProductById(id: string): Promise<AdminProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      sale_price,
      description,
      featured,
      new_arrival,
      stock,
      stock_quantity,
      track_inventory,
      low_stock_threshold,
      category_id,
      categories(name),
      product_images(image_url, sort_order, is_primary)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const images = Array.isArray(data.product_images) ? data.product_images : [];
  const sortedImages = [...images].sort((a, b) => {
    if (Boolean(a.is_primary) !== Boolean(b.is_primary)) {
      return a.is_primary ? -1 : 1;
    }
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const category = Array.isArray(data.categories)
    ? data.categories[0]
    : data.categories;

  return {
    id: data.id,
    name: data.name ?? "",
    slug: data.slug ?? "",
    price: data.price ?? 0,
    sale_price: data.sale_price ?? null,
    category: category?.name ?? "",
    category_id: data.category_id ?? null,
    image: sortedImages[0]?.image_url ?? "",
    stock: data.stock_quantity ?? data.stock ?? 0,
    stock_quantity: data.stock_quantity ?? null,
    description: data.description ?? "",
    featured: Boolean(data.featured),
    new_arrival: Boolean(data.new_arrival),
    track_inventory: data.track_inventory ?? null,
    low_stock_threshold: data.low_stock_threshold ?? null,
  };
}

export async function updateProduct(product: AdminProduct): Promise<void> {
  const price = Number(product.price);
  const salePrice =
    product.sale_price === null || product.sale_price === ""
      ? null
      : Number(product.sale_price);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Product price must be a valid non-negative number.");
  }

  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) {
    throw new Error("Sale price must be a valid non-negative number.");
  }

  const stockQuantity = Number(product.stock_quantity ?? product.stock ?? 0);

  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new Error("Stock must be a valid non-negative whole number.");
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: product.name.trim(),
      slug: product.slug.trim(),
      price,
      sale_price: salePrice,
      description: product.description,
      featured: product.featured,
      new_arrival: product.new_arrival ?? false,
      category_id: product.category_id ?? null,
      stock_quantity: stockQuantity,
    })
    .eq("id", product.id);

  if (error) throw error;

  if (product.image.trim()) {
    const { data: existingImage, error: imageLookupError } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", product.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (imageLookupError) throw imageLookupError;

    if (existingImage) {
      const { error: imageUpdateError } = await supabase
        .from("product_images")
        .update({ image_url: product.image.trim() })
        .eq("id", existingImage.id);

      if (imageUpdateError) throw imageUpdateError;
    } else {
      const { error: imageInsertError } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          image_url: product.image.trim(),
          is_primary: true,
          sort_order: 0,
        });

      if (imageInsertError) throw imageInsertError;
    }
  }
}
