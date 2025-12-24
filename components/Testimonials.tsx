export default function Testimonials() {
  const data = [
    {
      name: "John Mwangi",
      role: "Community Leader, Kenya",
      text: "Serena Green has transformed our village through sustainable tree planting and education."
    },
    {
      name: "Ayesha Noor",
      role: "Environmental Volunteer, Pakistan",
      text: "A remarkable initiative — empowering youth and restoring our natural heritage!"
    },
    {
      name: "Grace Nkurunziza",
      role: "Eco Guide, Rwanda",
      text: "Our forests are healing thanks to Serena’s continued support and green efforts."
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <h2 className="text-4xl text-center font-bold mb-10 text-green-700">
        What People Say
      </h2>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
        {data.map((t, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <p className="text-gray-600 italic mb-4">“{t.text}”</p>
            <h3 className="text-lg font-bold text-gray-800">{t.name}</h3>
            <p className="text-sm text-gray-500">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
