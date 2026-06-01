'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = 'https://mrk-visuals-api.onrender.com/api';

export default function PublicGalleries() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/galleries`)
      .then(res => res.json())
      .then(data => setGalleries(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light">Public Galleries</h1>
          <p className="text-gray-500 mt-4">Browse our featured client galleries</p>
        </div>

        {galleries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">📸</p>
            <p className="text-gray-500 text-lg">No public galleries available yet.</p>
            <p className="text-gray-400">Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {galleries.map(g => (
              <Link
                key={g.id}
                href={`/gallery/${g.slug}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 block"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={g.coverImage} alt={g.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                  <div className="text-white">
                    <p className="font-semibold text-xl">{g.title}</p>
                    <p className="text-sm text-gray-300">{g.date}</p>
                    <p className="text-sm mt-1">{g.photos?.length || 0} photos</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}