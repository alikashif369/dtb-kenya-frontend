export default function GeographicDistribution() {
  return (
    <section id="map" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900">Geographic Distribution</h2>
        <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
          Our environmental footprint spans multiple countries with diverse ecosystems including
          forests, mountains, beaches, wetlands, and deserts.
        </p>

        {/* Placeholder container if needed */}
        <div className="h-[500px] w-full bg-gray-300 mt-12 rounded-xl shadow-inner flex items-center justify-center text-gray-500">
          <span className="italic">Interactive Map Integrated Above (Hero Section)</span>
        </div>
      </div>
    </section>
  );
}
