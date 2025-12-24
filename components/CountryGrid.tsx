"use client";
import Image from "next/image";
import { useState } from "react";

export default function CountryGrid() {
  const countries = [
    { name: "Pakistan", icon: "/icons/Pakistan.jpg", activeSites: 10, status: "Active" },
    { name: "Kenya", icon: "/icons/Kenya.png", activeSites: 6, status: "Active" },
    { name: "Tanzania", icon: "/icons/Tanzania.png", activeSites: 3, status: "Inactive" },
    { name: "Uganda", icon: "/icons/uganda.jpg", activeSites: 5, status: "Active" },
    { name: "Rwanda", icon: "/icons/Rawanda.png", activeSites: 2, status: "Inactive" },
  ];

  const [flipped, setFlipped] = useState<boolean[]>(Array(countries.length).fill(false));

  const toggleFlip = (index: number) => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
  };

  return (
    <section className="py-20 bg-white" id="countries">
      <h2 className="text-4xl font-bold text-center text-green-700 mb-12">
        Geographic Presence
      </h2>

      <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-8 px-6">
        {countries.map((c, i) => (
          <div key={i} className="perspective cursor-pointer" onClick={() => toggleFlip(i)}>
            <div
              className={`relative w-full h-52 transform-style preserve-3d transition-transform duration-700 ${
                flipped[i] ? "rotate-y-180" : ""
              } hover:scale-105`}
            >
              {/* Front Side */}
              <div className="absolute w-full h-full bg-gray-200 p-6 rounded-xl shadow-md flex flex-col items-center justify-center backface-hidden hover:bg-green-100 hover:shadow-lg transition-shadow duration-300">
                <Image
                  src={c.icon}
                  width={60}
                  height={60}
                  alt={c.name}
                  className="mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-800">{c.name}</h3>
              </div>

              {/* Back Side */}
              {/* Back Side */}
<div
  className="absolute w-full h-full p-6 rounded-xl flex flex-col items-center justify-center backface-hidden rotate-y-180 transition-colors duration-300"
  style={{
    background: "linear-gradient(135deg, #ebf9f1, #dff4e6)", // very light green gradient
  }}
>
  {/* Active Sites in one line */}
  <p className="text-green-900 font-semibold text-lg mb-3 text-center whitespace-nowrap">
    Active Sites: {c.activeSites}
  </p>

  {/* Status tag with spacing */}
  <span
    className={`px-3 py-1 rounded-full text-sm font-medium mt-2 ${
      c.status === "Active"
        ? "bg-green-200 text-green-800"
        : "bg-red-100 text-red-700"
    }`}
  >
    {c.status}
  </span>
</div>

            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-style {
          transform-style: preserve-3d;
        }
      `}</style>
    </section>
  );
}
