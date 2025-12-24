export default function Newsletter() {
  return (
    <section className="py-20 bg-green-700 text-white text-center">
      <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
      <p className="mb-8 max-w-xl mx-auto">
        Join our mailing list to receive environmental updates, plantation drives,
        and sustainability insights.
      </p>

      <div className="flex justify-center">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-3 rounded-l-lg w-72 text-black"
        />
        <button className="px-6 py-3 bg-black rounded-r-lg">Subscribe</button>
      </div>
    </section>
  );
}
