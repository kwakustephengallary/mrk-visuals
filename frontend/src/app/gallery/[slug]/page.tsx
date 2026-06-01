'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function GalleryPage() {
  const { slug } = useParams();
  const [gallery, setGallery] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/galleries/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setGallery(data);
          setIsLocked(data.isLocked !== false);
          setIsPaid(data.isPaid || false);
          
          // Check if unlocked
          const unlocked = localStorage.getItem(`unlocked_${data.id}`);
          if (unlocked === 'true' || data.isPaid) {
            setIsLocked(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGallery();
  }, [slug]);

  // Disable right click on images
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handleUnlock = () => {
    if (gallery && password === gallery.password) {
      setIsLocked(false);
      localStorage.setItem(`unlocked_${gallery.id}`, 'true');
      setShowPassword(false);
    } else {
      alert('Wrong password!');
    }
  };

  const handleDownload = (photoUrl: string, index: number) => {
    if (isLocked) return;
    
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `MRK-Visuals-${gallery.title}-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-light mb-2">Gallery Not Found</h1>
          <p className="text-gray-500">This gallery doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const displayPhotos = gallery.photos;

  return (
    <div className="min-h-screen bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Gallery Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            {gallery.title}
          </h1>
          <p className="text-gray-600">
            {new Date(gallery.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {isPaid && (
            <span className="inline-block mt-3 bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
              ✅ Paid
            </span>
          )}
        </div>

        {/* Lock Screen - Shows only when locked AND unpaid */}
        {isLocked && !isPaid && (
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10 mb-8 text-center max-w-md mx-auto border border-gray-200 shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-gray-900 to-gray-300" />
            <div className="text-7xl mb-6">🔒</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">Gallery Locked</h2>
            <p className="text-gray-500 mb-6">
              {gallery.photos.length} beautiful photos waiting for you
            </p>
            
            <div className="bg-white rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Photos</span>
                <span className="font-semibold">{gallery.photos.length} photos</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-black h-2 rounded-full w-0" />
              </div>
              <p className="text-xs text-gray-400 mt-2">No preview available</p>
            </div>
            
            {gallery.price > 0 && (
              <>
                <p className="text-3xl font-bold text-gray-900 mb-2">GHS {gallery.price}</p>
                <p className="text-gray-400 text-sm mb-6">One-time payment for full access</p>
              </>
            )}
            
            {!showPassword ? (
              <button
                onClick={() => setShowPassword(true)}
                className="w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
              >
                Unlock with Password
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Enter gallery password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center focus:border-black focus:outline-none transition-colors"
                  autoFocus
                />
                <button
                  onClick={handleUnlock}
                  className="w-full bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium"
                >
                  Unlock
                </button>
                <button
                  onClick={() => setShowPassword(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-6">
              After payment, gallery will be unlocked automatically
            </p>
          </div>
        )}

        {/* Unlocked Badge */}
        {!isLocked && (
          <div className="text-center mb-8 flex items-center justify-center gap-4">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              🔓 Gallery Unlocked
            </span>
          </div>
        )}

        {/* Photo Grid */}
        {!isLocked && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayPhotos.map((photo: any, index: number) => (
              <div
                key={index}
                className="relative aspect-square group overflow-hidden rounded-xl bg-gray-100"
              >
                {/* Click to view */}
                <div
                  className="w-full h-full cursor-pointer"
                  onClick={() => setSelectedPhoto(index)}
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    draggable="false"
                  />
                  {/* Watermark */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-3">
                      <p className="text-white text-xs font-light opacity-70">© MR.K Visuals</p>
                    </div>
                  </div>
                </div>

                {/* Download Button (only if unlocked) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(photo.url, index);
                  }}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-lg px-3 py-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg flex items-center gap-1"
                >
                  ⬇ Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto !== null && !isLocked && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 z-10"
            onClick={() => setSelectedPhoto(null)}
          >
            ✕
          </button>
          
          <button
            className="absolute left-4 text-white text-5xl hover:text-gray-300 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : displayPhotos.length - 1);
            }}
          >
            ‹
          </button>
          
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={displayPhotos[selectedPhoto].url}
              alt={`Photo ${selectedPhoto + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              draggable="false"
            />
            {/* Watermark on lightbox */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/40 text-sm">© MR.K Visuals</p>
            </div>
          </div>
          
          <button
            className="absolute right-4 text-white text-5xl hover:text-gray-300 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(selectedPhoto < displayPhotos.length - 1 ? selectedPhoto + 1 : 0);
            }}
          >
            ›
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              {selectedPhoto + 1} / {displayPhotos.length}
            </p>
            <button
              onClick={() => handleDownload(displayPhotos[selectedPhoto].url, selectedPhoto)}
              className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              ⬇ Download This Photo
            </button>
          </div>
        </div>
      )}

      {/* Locked message when trying to access */}
      {isLocked && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">
            🔒 Gallery is locked. Complete payment to view photos.
          </p>
        </div>
      )}
    </div>
  );
}