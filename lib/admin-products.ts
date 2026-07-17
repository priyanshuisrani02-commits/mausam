export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  category: string;
  image: string;
  stock: number;
  description: string;
  featured: boolean;
};

const STORAGE_KEY = "admin-products";

export function getProducts(): AdminProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(STORAGE_KEY);

  return saved ? JSON.parse(saved) : [];
}

export function saveProducts(
  products: AdminProduct[]
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(products)
  );
}

export function addProduct(
  product: AdminProduct
) {
  const products = getProducts();

  products.push(product);

  saveProducts(products);
}

export function deleteProduct(
  id: string
) {
  const products = getProducts();

  saveProducts(
    products.filter(
      (product) => product.id !== id
    )
  );
}
export function getProductById(
  id: string
) {
  return getProducts().find(
    (product) => product.id === id
  );
}

export function updateProduct(
  updatedProduct: AdminProduct
) {
  const products = getProducts();

  saveProducts(
    products.map((product) =>
      product.id === updatedProduct.id
        ? updatedProduct
        : product
    )
  );
}
export function getProductBySlug(
  slug: string
) {
  return getProducts().find(
    (product) => product.slug === slug
  );
}
