"use client";

import { motion } from "framer-motion";
import { Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const speciesData = [
  {
    name: "Pinus roxburghii",
    commonName: "Chir Pine",
    description: "Native to the Himalayas, this drought-hardy pine is vital for reforestation in the foothills of Pakistan.",
    image: "https://green.serena.com.pk/assets/Species/Pinus%20roxburghii%20Sargent/Pinus%20roxburghii%20Sargent1.jpg"
  },
  {
    name: "Cedrus deodara",
    commonName: "Deodar Cedar",
    description: "The national tree of Pakistan. A large evergreen cedar with drooping branches, renowned for its durable wood.",
    image: "https://green.serena.com.pk/assets/Species/Cedrus%20deodara%20(Roxb.%20Ex%20Lamb.)%20G.%20Don/Cedrus%20deodara%20(Roxb.%20Ex%20Lamb.)%20G.%20Don1.jpg"
  },
  {
    name: "Prunus padus",
    commonName: "Bird Cherry",
    description: "A deciduous tree with beautiful white fragrant flowers, native to the northern temperate zones.",
    image: "https://green.serena.com.pk/assets/Species/Prunus%20padus%20L/Prunus%20padus%20L1.jpg"
  },
  {
    name: "Olea ferruginea",
    commonName: "Indian Olive",
    description: "A hardy evergreen tree found in the lower hills, adapted to arid climates and drought resistant.",
    image: "https://green.serena.com.pk/assets/Species/Olea%20ferruginea%20Royle/Olea%20ferruginea%20Royle1.jpg"
  },
  {
    name: "Morus alba",
    commonName: "White Mulberry",
    description: "Fast-growing deciduous tree, historically significant for sericulture and widely planted for shade.",
    image: "https://green.serena.com.pk/assets/Species/Morus%20alba%20Linn/Morus%20alba%20Linn1.jpg"
  }
];

export default function SpeciesShowcase() {
  return (
    <section className="relative bg-gradient-to-b from-white via-serena-sand/30 to-white py-28 overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #115e59 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-[1px] bg-serena-gold" />
            <Leaf className="w-5 h-5 text-serena-gold" />
            <span className="text-serena-gold text-sm font-semibold uppercase tracking-[0.25em]">Biodiversity</span>
            <Leaf className="w-5 h-5 text-serena-gold" />
            <div className="w-12 h-[1px] bg-serena-gold" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-green-950 mb-6">
            Indigenous Flora
          </h2>

          <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
            Discover the diverse species we nurture across our sanctuaries, chosen for their ecological resilience and value to local communities.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative px-6 md:px-12"
        >
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={24}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            pagination={{
              clickable: true,
              el: '.species-pagination'
            }}
            navigation={{
              nextEl: '.species-next',
              prevEl: '.species-prev'
            }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 }
            }}
            className="pb-4"
          >
            {speciesData.map((species) => (
              <SwiperSlide key={species.name} className="h-auto">
                <div className="group cursor-pointer h-full">
                  {/* Redesigned Card with Better Visual Hierarchy */}
                  <div className="relative bg-gradient-to-br from-white to-serena-sand/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-serena-sand/50 backdrop-blur-sm h-[420px] flex flex-col">

                    {/* Light Screen Effect on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-serena-gold/0 to-transparent opacity-0 group-hover:opacity-100 group-hover:from-white/40 group-hover:via-serena-gold/20 transition-all duration-700 pointer-events-none z-10" />

                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-20" />

                    {/* Image Container */}
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={species.image}
                        alt={species.commonName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                      />
                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 group-hover:from-serena-green/80 group-hover:via-serena-green/40 transition-all duration-500" />

                      {/* Scientific Name Badge - Improved Design */}
                      <div className="absolute top-4 left-4 z-30">
                        <span className="inline-flex items-center bg-white/95 backdrop-blur-sm text-serena-green px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xl border-2 border-serena-green/30 group-hover:bg-serena-green group-hover:text-serena-gold group-hover:border-serena-gold group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                          <Leaf className="w-3 h-3 mr-1.5 text-serena-gold transition-colors duration-300" />
                          {species.name}
                        </span>
                      </div>

                      {/* Common Name on Image - Enhanced Typography */}
                      <div className="absolute bottom-6 left-6 right-6 z-10">
                        <h3 className="text-3xl font-serif font-bold text-white drop-shadow-2xl group-hover:text-serena-gold transition-colors duration-300">
                          {species.commonName}
                        </h3>
                      </div>
                    </div>

                    {/* Content - Fixed Height for Description */}
                    <div className="p-6 flex-grow bg-gradient-to-b from-transparent to-white/50 flex items-start">
                      <p className="text-gray-700 text-sm leading-relaxed font-medium line-clamp-4">
                        {species.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Enhanced Navigation Buttons with Light Effect */}
          <button
            className="species-prev absolute left-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/95 backdrop-blur-md border-2 border-serena-green/40 rounded-full flex items-center justify-center text-serena-green hover:scale-110 transition-all duration-300 shadow-2xl -translate-x-2 md:translate-x-0 group overflow-hidden hover:border-serena-green"
            aria-label="Previous species"
          >
            {/* Solid Background on Hover - Prevents white appearance */}
            <div className="absolute inset-0 bg-serena-green opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300 z-0 pointer-events-none" />

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-serena-gold/20 via-serena-gold/10 to-transparent opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500 z-10 pointer-events-none" />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 pointer-events-none" />

            <ChevronLeft strokeWidth={2.5} className="w-5 h-5 relative z-50 text-serena-green group-hover:text-serena-gold group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />
          </button>
          <button
            className="species-next absolute right-0 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-white/95 backdrop-blur-md border-2 border-serena-green/40 rounded-full flex items-center justify-center text-serena-green hover:scale-110 transition-all duration-300 shadow-2xl translate-x-2 md:translate-x-0 group overflow-hidden hover:border-serena-green"
            aria-label="Next species"
          >
            {/* Solid Background on Hover - Prevents white appearance */}
            <div className="absolute inset-0 bg-serena-green opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300 z-0 pointer-events-none" />

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-l from-serena-gold/20 via-serena-gold/10 to-transparent opacity-0 group-hover:opacity-100 rounded-full transition-all duration-500 z-10 pointer-events-none" />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent z-20 pointer-events-none" />

            <ChevronRight strokeWidth={2.5} className="w-5 h-5 relative z-50 text-serena-green group-hover:text-serena-gold group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />
          </button>
        </motion.div>

        {/* Pagination Dots */}
        <div className="species-pagination flex justify-center gap-2 mt-8" />
      </div>
    </section>
  );
}
