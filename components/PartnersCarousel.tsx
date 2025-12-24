export default function PartnersCarousel({ partners }: { partners: any[] }) {
  
  return (
    <section id="partners" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Section Title */}
        <h2 className="text-4xl font-bold text-center mb-12 heading-font text-gray-900">
          Our Partner Organizations
        </h2>

        {/* Marquee-style Scrolling Container */}
        <div className="overflow-hidden relative">
          <div className="flex whitespace-nowrap animate-scroll-x gap-12">
            {partners.map((p) => (
              <img
                key={p.id}
                src={p.logoUrl}
                alt={p.name}
                className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition duration-300 cursor-pointer"
              />
            ))}

            {/* Duplicate set to create seamless infinite scroll */}
            {partners.map((p) => (
              <img
                key={p.id + '-duplicate'}
                src={p.logoUrl}
                alt={p.name}
                className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition duration-300 cursor-pointer"
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
