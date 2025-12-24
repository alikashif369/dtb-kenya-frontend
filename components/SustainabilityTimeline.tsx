import React from "react";
import { FaLeaf } from 'react-icons/fa'; // Icon for the timeline marker

export default function SustainabilityTimeline() {
  const steps = [
    { year: "2018", text: "Initiation of Serena Green Campaign and first pilot projects." },
    { year: "2019", text: "Tree Plantation Drives Expanded across Pakistan, reaching 50+ sites." },
    { year: "2021", text: "Formal partnerships established with Global Conservation Agencies for funding and expertise." },
    { year: "2023", text: "Africa-wide Sustainability Expansion Launched, beginning with East African nations." },
    { year: "2024", text: "Smart Environmental Monitoring System (SEMS) and remote sensing technology introduced." },
  ];

  return (
    <section id="timeline" className="py-16 bg-gray-50">
      <h2 className="text-3xl text-center font-extrabold text-green-700 mb-12 tracking-tight">
         Key Milestones
      </h2>

      <div className="max-w-4xl mx-auto relative">
        {/* Central Vertical Timeline Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-300 transform -translate-x-1/2"></div>

        {steps.map((s, i) => (
          <div
            key={i}
            // FIX 2: Reduced vertical margin-bottom (mb-8) for tighter spacing
            className={`
              flex items-center mb-8 
              ${i % 2 === 0 ? "flex-row justify-start" : "flex-row-reverse justify-start"}
            `}
          >
            {/* Timeline Item Card */}
            <div className="w-1/2 p-3">
              <div
                className={`
                  bg-green-50 p-5 rounded-lg 
                  // FIX 1: Increased shadow strength (shadow-lg)
                  shadow-lg transition-all duration-300
                  border border-green-100 
                  hover:shadow-xl hover:scale-[1.01] 
                  ${i % 2 === 0 ? "ml-auto mr-6" : "mr-auto ml-6"} 
                `}
              >
                <h3 className="text-xl font-bold text-green-700">{s.year}</h3>
                <p className="text-gray-700 mt-2 text-sm leading-snug">{s.text}</p>
              </div>
            </div>

            {/* Timeline Marker (Dot) with Icon */}
            <div className="relative z-10">
              <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center shadow-md">
                 <FaLeaf className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Empty Space / Opposite Side */}
            <div className="w-1/2"></div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10 text-gray-500 text-sm">
          <p>Inspiring Change, One Milestone at a Time.</p>
      </div>
    </section>
  );
}