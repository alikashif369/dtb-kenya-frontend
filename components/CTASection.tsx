export default function CTASection() {
  return (
    <section className="py-16 bg-green-700 text-white text-center">
      <h2 className="text-4xl font-bold mb-4">Join the Sustainability Mission</h2>
      <p className="text-lg mb-8">
        Help us create greener, cleaner, and more sustainable communities across the globe.
      </p>

      <a
        href="dashboard"
        className="bg-white text-green-700 px-10 py-4 text-lg font-bold rounded-lg shadow hover:bg-gray-200"
      >
        Open Dashboard
      </a>
    </section>
  );
}
