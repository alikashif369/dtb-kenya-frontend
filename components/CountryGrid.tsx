"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const countries = [
  { name: "Pakistan", icon: "/icons/Pakistan.jpg" },
  { name: "Kenya", icon: "/icons/Kenya.png" },
  { name: "Tanzania", icon: "/icons/Tanzania.png" },
  { name: "Uganda", icon: "/icons/uganda.jpg" },
  { name: "Rwanda", icon: "/icons/Rawanda.png" },
];

export default function CountryGrid() {
  return (
    <section className="py-12 w-full" id="countries">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          {countries.map((country, index) => (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:border-green-50 transition-colors duration-300">
                <Image
                  src={country.icon}
                  alt={country.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="text-xl font-serif font-medium text-gray-800 tracking-wide group-hover:text-green-700 transition-colors">
                {country.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
