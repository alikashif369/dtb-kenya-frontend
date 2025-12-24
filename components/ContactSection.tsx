export default function ContactSection() {
  return (
    <section className="py-20 bg-white" id="contact">
      <h2 className="text-4xl font-bold text-center text-green-700 mb-10">
        Contact Us
      </h2>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 px-6">

        <div>
          <h3 className="text-2xl font-semibold mb-4">Get in Touch</h3>
          <p className="text-gray-600 mb-4">
            Serena Green Initiative Headquarters  
            Islamabad, Pakistan  
          </p>

          <p>Email: info@serenagreen.org</p>
          <p>Phone: +92 51 0000000</p>
        </div>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.123123!2d73.0689!3d33.6844"
          className="w-full h-72 rounded-xl shadow"
          loading="lazy"
        ></iframe>

      </div>
    </section>
  );
}
