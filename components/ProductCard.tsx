import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  slug: string;
}

export default function ProductCard({
  name,
  price,
  image,
  slug,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-3xl">
          <img
  src={image || "/images/products/product1.png"}
  alt={name}
  className="h-[450px] w-full object-cover transition duration-500 group-hover:scale-110"
/>
          <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/20" />

          <div className="absolute left-4 top-4 rounded-full bg-white px-4 py-1 text-sm font-medium">
            NEW
          </div>

          <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition duration-300 group-hover:opacity-100">
            ♡
          </button>

          <button className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-6 rounded-full bg-white px-6 py-3 text-black opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Add to Cart
          </button>
        </div>

        <h3 className="mt-5 text-xl font-medium">{name}</h3>

       <p className="mt-2 text-gray-500">
  ₹{price.toLocaleString("en-IN")}
</p>
      </div>
    </Link>
  );
}