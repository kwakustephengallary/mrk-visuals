'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const API_URL = 'https://mrk-visuals-api.onrender.com/api';

export default function Home() {
  const [recentWorks, setRecentWorks] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1600',
  ];

  useEffect(() => {
    fetch(`${API_URL}/recent-works`)
      .then(res => res.json())
      .then(data => setRecentWorks(data))
      .catch(err => console.error(err));

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}
        
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
          <div>
            <p className="text-sm md:text-base uppercase tracking-[.4em] mb-6 text-gray-300">
              Premium Photography & Cinematography
            </p>
            <h1 className="text-5xl md:text-8xl font-light mb-8 tracking-tight">
              MR.K VISUALS
            </h1>
            <p className="text-lg md:text-xl font-light mb-12 text-gray-300 max-w-xl mx-auto">
              Capturing timeless moments with artistry, elegance, and passion
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/portfolio" className="bg-white text-black px-10 py-4 rounded-full hover:bg-gray-200 transition-all font-medium text-lg">
                View Portfolio
              </Link>
              <Link href="/contact" className="border-2 border-white text-white px-10 py-4 rounded-full hover:bg-white hover:text-black transition-all font-medium text-lg">
                Book a Session
              </Link>
            </div>
            <div className="flex justify-center gap-3 mt-12">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Works Section */}
      {recentWorks.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm uppercase tracking-[.3em] text-gray-400 text-center mb-4">Recent Works</p>
            <h2 className="text-4xl md:text-5xl font-light text-center mb-16">Featured Galleries</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {recentWorks.map((work, i) => (
                <Link
                  key={i}
                  href={work.link || '#'}
                  className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 block"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <div className="text-white">
                      <p className="font-semibold text-xl">{work.title}</p>
                      {work.description && <p className="text-sm text-gray-300 mt-1">{work.description}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold">500+</p>
            <p className="text-gray-400 text-sm">Projects Done</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">300+</p>
            <p className="text-gray-400 text-sm">Happy Clients</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold">8+</p>
            <p className="text-gray-400 text-sm">Years Experience</p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm uppercase tracking-[.3em] text-gray-400 text-center mb-4">Services</p>
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📸', title: 'Photography', desc: 'Professional photo shoots for weddings, events, and portraits.' },
              { icon: '🎥', title: 'Cinematography', desc: 'Cinematic films that capture the emotion of your special moments.' },
              { icon: '🖼️', title: 'Client Galleries', desc: 'Private online galleries to view, select, and download your photos.' },
            ].map((service, i) => (
              <div key={i} className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="text-5xl mb-6">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-500">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center bg-black text-white">
        <h2 className="text-3xl md:text-4xl font-light mb-6">Ready to Create Something Beautiful?</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Let's collaborate and bring your vision to life.</p>
        <Link href="/contact" className="inline-block bg-white text-black px-10 py-4 rounded-full hover:bg-gray-200 transition-all font-medium text-lg">
          Get in Touch
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-400 text-sm border-t">
        <p className="mb-2 text-black font-semibold tracking-wider">MR.K VISUALS</p>
        <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}