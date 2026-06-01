'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function GalleryPage() {
  const { slug } = useParams();
  const [gallery, setGallery] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [unlockedPhotos, setUnlockedPhotos] = useState<string[]>([]);
  const [selectedPhotosForPayment, setSelectedPhotosForPayment] = useState<string[]>([]);

  useEffect(() => {
    // Load Paystack script
    if (!document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }

    fetchGallery();
  }, [slug]);

  const fetchGallery = async () => {
    try {
      const storedEmail = localStorage.getItem(`email_${slug}`);
      const storedPassword = localStorage.getItem(`password_${slug}`);
      
      let url = `https://mrk-visuals-api.onrender.com/api/galleries/${slug}`;
      if (storedEmail && storedPassword) {
        url += `?email=${encodeURIComponent(storedEmail)}&password=${encodeURIComponent(storedPassword)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.accessDenied) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      setGallery(data);
      setIsLocked(data.isLocked !== false);
      setIsPaid(data.isPaid || false);
      setUnlockedPhotos(data.unlockedPhotos || []);
      
      const unlocked = localStorage.getItem(`unlocked_${data.id}`);
      if (unlocked === 'true' || data.isPaid) {
        setIsLocked(false);
        setUnlockedPhotos(data.photos.map((p: any) => p.id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const handlePaystackPayment = (amount: number, photoIds?: string[]) => {
    if (!gallery) return;

    // Wait for Paystack to load
    const openPaystack = () => {
      if (typeof window.PaystackPop === 'undefined') {
        setTimeout(openPaystack, 500);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: 'pk_live_beaf994cee5d20a1c612a1571b22fa8df74e8536',
        email: email || gallery.clientEmail || 'client@email.com',
        amount: amount * 100,
        currency: 'GHS',
        channels: ['card', 'mobile_money'],
        ref: `MRK_${Date.now()}`,
        label: 'MR.K Visuals',
        metadata: { gallery_id: gallery.id },
        onSuccess: (transaction: any) => {
          fetch(`https://mrk-visuals-api.onrender.com/api/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: transaction.reference,
              galleryId: gallery.id,
              photoIds: photoIds || null,
            }),
          }).then(() => {
            fetchGallery();
            alert('Payment successful! 🎉');
          });
        },
        onCancel: () => alert('Payment cancelled'),
      });
      handler.openIframe();
    };

    openPaystack();
  };

  const handleAccess = () => {
    if (gallery.privacy === 'private') {
      localStorage.setItem(`email_${slug}`, email);
      localStorage.setItem(`password_${slug}`, password);
    } else {
      localStorage.setItem(`password_${slug}`, password);
    }
    fetchGallery();
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

  const toggleFavorite = (index: number) => {
    let newFavorites: number[];
    if (favorites.includes(index)) {
      newFavorites = favorites.filter(f => f !== index);
    } else {
      newFavorites = [...favorites, index];
    }
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${slug}`, JSON.stringify(newFavorites));
  };

  const togglePhotoSelection = (photoId: string) => {
    if (selectedPhotosForPayment.includes(photoId)) {
      setSelectedPhotosForPayment(selectedPhotosForPayment.filter(id => id !== photoId));
    } else {
      setSelectedPhotosForPayment([...selectedPhotosForPayment, photoId]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Access denied screen for private galleries
  if (accessDenied || (gallery?.privacy === 'private' && !localStorage.getItem(`email_${slug}`))) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🔐</div>
          <h1 className="text-2xl font-semibold mb-2">Private Gallery</h1>
          <p className="text-gray-500 mb-8">Enter your email and password to access this gallery.</p>
          
          <div className="space-y-4">
            {gallery?.privacy === 'private' && (
              <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center focus:border-black focus:outline-none" />
            )}
            <input type="password" placeholder="Gallery password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center focus:border-black focus:outline-none" />
            <button onClick={handleAccess} className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 font-medium">
              Access Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayPhotos = gallery?.photos || [];
  const filteredPhotos = showFavorites
    ? displayPhotos.filter((_: any, i: number) => favorites.includes(i))
    : displayPhotos;

  const totalSelectedPrice = selectedPhotosForPayment.reduce((sum: number, photoId: string) => {
    const photo = gallery?.photos.find((p: any) => p.id === photoId);
    return sum + (photo?.price || 0);
  }, 0);

  // Calculate installment progress
  const installmentProgress = gallery?.installment?.parts?.map((part: any, i: number) => {
    const totalBeforeThis = gallery.installment.parts.slice(0, i).reduce((s: number, p: any) => s + p.amount, 0);
    return {
      ...part,
      isUnlocked: gallery.paidAmount >= totalBeforeThis + part.amount,
      isCurrent: gallery.paidAmount >= totalBeforeThis && gallery.paidAmount < totalBeforeThis + part.amount,
    };
  });

  return (
    <div className="min-h-screen bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">{gallery.title}</h1>
          <p className="text-gray-600">{new Date(gallery.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {gallery.privacy === 'private' && <span className="text-xs bg-yellow-100 px-2 py-1 rounded-full ml-2">🔒 Private</span>}
          {isPaid && <span className="inline-block mt-3 bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">✅ Fully Paid</span>}
        </div>

        {/* Lock Screen / Payment Screen */}
        {isLocked && !isPaid && (
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10 mb-8 text-center max-w-md mx-auto border shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 via-gray-900 to-gray-300" />
            <div className="text-7xl mb-6">🔒</div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-900">Gallery Locked</h2>
            <p className="text-gray-500 mb-6">{gallery.photos.length} photos waiting</p>

            {/* Full Gallery Pricing */}
            {(gallery.pricingType === 'full' || !gallery.pricingType) && gallery.price > 0 && (
              <>
                <p className="text-3xl font-bold mb-2">GHS {gallery.price}</p>
                <button onClick={() => handlePaystackPayment(gallery.price)} className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 font-medium text-lg mb-4">
                  💳 Pay GHS {gallery.price}
                </button>
              </>
            )}

            {/* Installment Pricing */}
            {gallery.pricingType === 'installment' && installmentProgress && (
              <div className="space-y-3 mb-6">
                {installmentProgress.map((part: any, i: number) => (
                  <div key={i} className={`p-4 rounded-xl border ${part.isUnlocked ? 'bg-green-50 border-green-200' : part.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{part.label}</span>
                      <span className="font-bold">GHS {part.amount}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Unlocks {part.photosToShow} photos</p>
                    {part.isUnlocked && <span className="text-green-600 text-sm">✅ Unlocked</span>}
                    {part.isCurrent && (
                      <button onClick={() => handlePaystackPayment(part.amount)} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm w-full">
                        Pay GHS {part.amount}
                      </button>
                    )}
                    {!part.isUnlocked && !part.isCurrent && <span className="text-gray-400 text-sm">🔒 Locked</span>}
                  </div>
                ))}
                <p className="text-sm text-gray-500">Paid: GHS {gallery.paidAmount || 0}</p>
              </div>
            )}

            {/* Per-Photo Pricing */}
            {gallery.pricingType === 'per-photo' && (
              <div className="mb-6">
                <p className="text-gray-600 mb-3">Select photos to purchase</p>
                {selectedPhotosForPayment.length > 0 && (
                  <button onClick={() => handlePaystackPayment(totalSelectedPrice, selectedPhotosForPayment)} className="w-full bg-green-600 text-white py-3 rounded-xl font-medium mb-2">
                    💳 Pay GHS {totalSelectedPrice} for {selectedPhotosForPayment.length} photo(s)
                  </button>
                )}
                <p className="text-sm text-gray-400">Click photos below to select them</p>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            {!showPassword ? (
              <button onClick={() => setShowPassword(true)} className="w-full bg-black text-white py-4 rounded-xl font-medium">
                Unlock with Password
              </button>
            ) : (
              <div className="space-y-3">
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 rounded-xl px-4 py-3 text-center" autoFocus />
                <button onClick={() => { if (password === gallery.password) { setIsLocked(false); localStorage.setItem(`unlocked_${gallery.id}`, 'true'); } else alert('Wrong password!'); }}
                  className="w-full bg-black text-white py-3 rounded-xl font-medium">Unlock</button>
              </div>
            )}
          </div>
        )}

        {/* Photo Grid */}
        {!isLocked && (
          <>
            <div className="text-center mb-8 flex items-center justify-center gap-4 flex-wrap">
              <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">🔓 Unlocked</span>
              <button onClick={() => setShowFavorites(!showFavorites)}
                className={`px-4 py-2 rounded-full text-sm border ${showFavorites ? 'bg-red-50 text-red-600' : 'bg-white text-gray-600'}`}>
                {showFavorites ? '❤️ Favorites' : `🤍 Favorites (${favorites.length})`}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo: any, index: number) => {
                const isPhotoUnlocked = unlockedPhotos.includes(photo.id) || isPaid;
                const isSelected = selectedPhotosForPayment.includes(photo.id);

                return (
                  <div key={index} className={`relative aspect-square group overflow-hidden rounded-xl bg-gray-100 ${!isPhotoUnlocked && gallery.pricingType === 'per-photo' ? 'opacity-50' : ''}`}>
                    {isPhotoUnlocked || gallery.pricingType !== 'per-photo' ? (
                      <div className="w-full h-full cursor-pointer" onClick={() => setSelectedPhoto(index)}>
                        <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" draggable="false" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent p-3">
                          <p className="text-white text-xs opacity-70">© MR.K Visuals</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <div className="text-center">
                          <p className="text-2xl mb-1">🔒</p>
                          <p className="text-sm font-medium">GHS {photo.price}</p>
                        </div>
                      </div>
                    )}

                    {/* Per-photo selection */}
                    {gallery.pricingType === 'per-photo' && !isPaid && (
                      <button onClick={(e) => { e.stopPropagation(); togglePhotoSelection(photo.id); }}
                        className={`absolute top-3 left-3 rounded-full w-8 h-8 flex items-center justify-center text-sm ${isSelected ? 'bg-green-500 text-white' : 'bg-white/80 text-gray-500'}`}>
                        {isSelected ? '✓' : '+'}
                      </button>
                    )}

                    {/* Favorite */}
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(index); }}
                      className={`absolute top-3 right-3 rounded-full p-2 transition-all ${favorites.includes(index) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400'}`}>
                      {favorites.includes(index) ? '❤️' : '🤍'}
                    </button>

                    {/* Download */}
                    {isPhotoUnlocked && (
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(photo.url, index); }}
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-white rounded-lg px-3 py-2 text-sm opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                        ⬇
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {isLocked && <div className="text-center py-16"><p className="text-gray-400 text-lg">🔒 Gallery locked. Complete payment to view photos.</p></div>}
      </div>

      {/* Lightbox */}
      {selectedPhoto !== null && !isLocked && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl z-10" onClick={() => setSelectedPhoto(null)}>✕</button>
          <button className="absolute left-4 text-white text-5xl z-10" onClick={(e) => { e.stopPropagation(); setSelectedPhoto(selectedPhoto > 0 ? selectedPhoto - 1 : filteredPhotos.length - 1); }}>‹</button>
          <div onClick={e => e.stopPropagation()}>
            <img src={filteredPhotos[selectedPhoto].url} alt="" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" draggable="false" />
            <p className="text-white/40 text-center text-sm mt-2">© MR.K Visuals</p>
          </div>
          <button className="absolute right-4 text-white text-5xl z-10" onClick={(e) => { e.stopPropagation(); setSelectedPhoto(selectedPhoto < filteredPhotos.length - 1 ? selectedPhoto + 1 : 0); }}>›</button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">{selectedPhoto + 1} / {filteredPhotos.length}</p>
            <button onClick={() => handleDownload(filteredPhotos[selectedPhoto].url, selectedPhoto)} className="bg-white text-black px-4 py-2 rounded-full text-sm hover:bg-gray-200">⬇ Download</button>
          </div>
        </div>
      )}
    </div>
  );
}