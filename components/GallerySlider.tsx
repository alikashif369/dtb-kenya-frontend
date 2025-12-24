"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Image from "next/image";

export default function GallerySlider() {
  const images = [
    "/gallery/plantation1.jpg",
    "/gallery/plantation2.jpg",
    "/gallery/plantation3.jpg",
  ];

  return (
    <section className="py-20 bg-gray-50">
      <h2 className="text-4xl text-center font-bold mb-10 text-green-700">
        Gallery
      </h2>

      <Swiper slidesPerView={1} loop={true} className="max-w-4xl mx-auto">
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <div className="w-full h-[400px] relative">
              <Image src={img} fill className="object-cover rounded-xl shadow-lg" alt="Gallery" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
