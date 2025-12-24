export default function KeyAchievements() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Key Achievements</h2>
          <p className="text-gray-600 mt-3 text-lg">
            Highlights of our sustainability progress across all regions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white shadow-md p-8 rounded-xl border-l-4 border-green-600">
            <i className="fas fa-tree text-4xl text-green-700 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Major Plantation Drives</h3>
            <p className="text-gray-600">
              Thousands of native species planted annually across Pakistan, Kenya, Tanzania, and more.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white shadow-md p-8 rounded-xl border-l-4 border-orange-600">
            <i className="fas fa-solar-panel text-4xl text-orange-600 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Solar Power Expansion</h3>
            <p className="text-gray-600">
              Energy-efficient solutions deployed at hotels, lodges, and community centers.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white shadow-md p-8 rounded-xl border-l-4 border-blue-600">
            <i className="fas fa-water text-4xl text-blue-600 mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Water Conservation</h3>
            <p className="text-gray-600">
              Smart irrigation, rainwater harvesting, and groundwater monitoring implemented.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
