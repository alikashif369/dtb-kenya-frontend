"use client";
import Image from "next/image";

export default function PartnersSlider() {
  const partners = [
    { id: 1, logoUrl: "/partners/wwf.png" },
    { id: 2, logoUrl: "/partners/akrsp.jpg" },
    { id: 3, logoUrl: "/partners/nust.jpg" },
    { id: 4, logoUrl: "/partners/weclean.jpg" },
  ];

  // Duplicate array for seamless infinite scroll
  const sliderItems = [...partners, ...partners, ...partners];

  return (
    <section id="partners" className="py-16 bg-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-green-700">
          Our Partners
        </h2>

        <div className="overflow-hidden relative">
          {/* Fading edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-gray-100 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-gray-100 to-transparent z-10" />

          {/* Slider */}
          <div className="flex whitespace-nowrap animate-scroll">
            {sliderItems.map((p, index) => (
              <div
                key={p.id + "-" + index}
                className="mx-8 inline-flex items-center justify-center w-[150px] h-[90px] bg-white rounded-lg shadow-sm"
              >
                <Image
                  src={p.logoUrl}
                  width={120}
                  height={80}
                  alt="Partner logo"
                  className="object-contain max-w-[120px] max-h-20"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

   
    </section>
  );
}
