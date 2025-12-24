"use client";

export default function SitePanel({ polygonData, form, setForm, onSave }: any) {
  return (
    <div className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Add New Site</h2>
        <p className="text-sm text-gray-600 mt-1">
          Draw a polygon on the map and fill in the details
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., North Field"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Species *
          </label>
          <input
            type="text"
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
            placeholder="e.g., Wheat"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Number of Plants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Plants
          </label>
          <input
            type="number"
            value={form.plants}
            onChange={(e) => setForm({ ...form, plants: e.target.value })}
            placeholder="e.g., 1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Area Information */}
        {polygonData ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-3">
              Polygon Area
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Square Meters:</span>
                <span className="text-sm font-medium text-green-900">
                  {polygonData.areaSqMeters.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  m²
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Acres:</span>
                <span className="text-sm font-medium text-green-900">
                  {polygonData.areaAcres.toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  })}{" "}
                  ac
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Click the polygon tool on the map to start drawing
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onSave}
          disabled={!polygonData || !form.name || !form.species}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Save Site
        </button>
        {(!polygonData || !form.name || !form.species) && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Please complete all required fields and draw a polygon
          </p>
        )}
      </div>
    </div>
  );
}