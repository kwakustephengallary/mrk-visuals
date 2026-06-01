import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="text-center text-white px-4 relative z-10">
          <p className="text-sm md:text-base uppercase tracking-[.3em] mb-4 text-gray-300">
            Premium Photography
          </p>
          <h1 className="text-5xl md:text-8xl font-light mb-6 tracking-tight">
            MR.K VISUALS
          </h1>
          <p className="text-lg md:text-xl font-light mb-10 text-gray-300 max-w-xl mx-auto">
            Capturing timeless moments with artistry and passion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="inline-block bg-white text-black px-8 py-4 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium"
            >
              View Portfolio
            </Link>
            <Link
              href="/contact"
              className="inline-block border border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300"
            >
              Book a Session
            </Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-3xl md:text-4xl font-bold mb-1">{stat.number}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 max-w-4xl mx-auto text-center">
        <p className="text-sm uppercase tracking-widest text-gray-400 mb-4">About</p>
        <h2 className="text-3xl md:text-4xl font-light mb-8">
          Capturing Your Best Moments
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
          We specialize in weddings, events, portraits, and commercial photography.
          Every shot tells a story, and we're here to tell yours with elegance and creativity.
        </p>
      </section>

      {/* Services */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm uppercase tracking-widest text-gray-400 text-center mb-4">Services</p>
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-500 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center bg-black text-white">
        <h2 className="text-3xl md:text-4xl font-light mb-6">
          Ready to Create Something Beautiful?
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Let's collaborate and bring your vision to life. Reach out today.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-black px-10 py-4 rounded-full hover:bg-gray-200 transition-all duration-300 font-medium"
        >
          Get in Touch
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-400 text-sm border-t border-gray-100">
        <p className="mb-2 text-black font-semibold tracking-wider">MR.K VISUALS</p>
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}

const stats = [
  { number: '500+', label: 'Projects Done' },
  { number: '300+', label: 'Happy Clients' },
  { number: '8+', label: 'Years Experience' },
];

const services = [
  {
    icon: '📸',
    title: 'Photography',
    description: 'Professional photo shoots for weddings, events, and portraits with premium editing.'
  },
  {
    icon: '🎥',
    title: 'Cinematography',
    description: 'Cinematic films that capture the emotion and beauty of your special moments.'
  },
  {
    icon: '🖼️',
    title: 'Client Galleries',
    description: 'Private online galleries to view, select, and download your favorite photos.'
  },
];