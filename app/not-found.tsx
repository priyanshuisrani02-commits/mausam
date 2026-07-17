import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[75vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-8xl font-light tracking-widest">
        404
      </h1>

      <h2 className="mt-6 text-3xl font-light md:text-5xl">
        Page Not Found
      </h2>

      <p className="mt-5 max-w-lg text-gray-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link
        href="/"
        className="mt-10 rounded-full bg-black px-8 py-4 text-white transition hover:bg-neutral-800"
      >
        Back to Home
      </Link>
    </main>
  );
}