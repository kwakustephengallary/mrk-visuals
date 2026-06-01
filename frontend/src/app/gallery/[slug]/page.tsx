'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API_URL = 'https://mrk-visuals-api.onrender.com/api';

export default function GalleryView() {
  const { slug } = useParams();
  const [gallery, setGallery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [isLocked, setIsLocked] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/galleries/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setGallery(data);
          setIsLocked(data.isLocked !== false);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleUnlock = () => {
    if (password === gallery.password) {
      setIsLocked(false);
    } else {
      alert('Wrong password!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-light">Gallery Not Found</h1>
        </div>
      </div>
    );
  }

  const photos = gallery.photos || [];
  const displayPhotos = isLocked ? photos.slice(0, 5) : photos;

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light">{gallery.title}</h1>
          <p className="text-gray-500 mt-2">{gallery.date}</p>
          {gallery.isPaid && <span className="text-green-600 text-sm">✅ Paid</span>}
        </div>

        {isLocked && (
          <div className="max-w-md mx-auto text-center bg-gray-50 rounded-2xl p-8 mb-8">
            <p className="text-5xl mb-4">🔒</p>
            <h2 className="text-xl font-semibold mb-2">Gallery Locked</h2>
            <p className="text-gray-500 mb-4">{photos.length} photos</p>
            {gallery.price > 0 && <p className="text-2xl font-bold mb-4">GHS {gallery.price}</p>}
            <div className="flex gap-2">
              <input type="text" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 text-center" />
              <button onClick={handleUnlock} className="bg-black text-white px-6 py-2 rounded-lg">Unlock</button>
            </div>
          </div>
        )}

        {!isLocked && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayPhotos.map((photo: any, i: number) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100" onClick={() => setSelectedPhoto(i)}>
                <img src={photo.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPhoto !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl">✕</button>
          <img src={displayPhotos[selectedPhoto].url} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" onClick={e => e.stopPropagation()} />
          <p className="absolute bottom-4 text-white text-sm">{selectedPhoto + 1} / {displayPhotos.length}</p>
        </div>
      )}
    </div>
  );
}