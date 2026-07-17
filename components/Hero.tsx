import Image from "next/image";

export default function Hero() {
  return (
   <section className="relative h-[60vh] min-h-[420px] md:h-[calc(100vh-120px)] w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/hero.png"
        alt="Hero Image"
        fill
        className="object-cover"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
      </div>

    </section>
  );
}