'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'https://mrk-visuals-api.onrender.com/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pricingType, setPricingType] = useState('full');
  const [photoPrices, setPhotoPrices] = useState<number[]>([]);
  const [installmentParts, setInstallmentParts] = useState([{ amount: 0, label: 'Part 1', photosToShow: 5 }]);
  const [newGallery, setNewGallery] = useState({
    title: '', date: '', price: '', password: '',
    privacy: 'private', clientEmail: '', photos: [] as File[],
  });

  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) router.push('/admin/login');
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/galleries`);
      setGalleries(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewGallery({ ...newGallery, photos: [...newGallery.photos, ...files] });
      setPhotoPrices([...photoPrices, ...Array(files.length).fill(0)]);
    }
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', newGallery.title);
      formData.append('date', newGallery.date);
      formData.append('price', newGallery.price);
      formData.append('password', newGallery.password);
      formData.append('privacy', newGallery.privacy);
      formData.append('clientEmail', newGallery.clientEmail);
      formData.append('pricingType', pricingType);
      
      if (pricingType === 'per-photo') {
        formData.append('photoPrices', JSON.stringify(photoPrices));
      }
      if (pricingType === 'installment') {
        formData.append('installmentPlan', JSON.stringify({ parts: installmentParts }));
      }

      newGallery.photos.forEach(photo => formData.append('photos', photo));

      const res = await fetch(`${API_URL}/galleries`, { method: 'POST', body: formData });
      if (res.ok) {
        alert('Gallery created!');
        setNewGallery({ title: '', date: '', price: '', password: '', privacy: 'private', clientEmail: '', photos: [] });
        setShowCreateForm(false);
        fetchGalleries();
      }
    } catch (error) { console.error(error); }
    setUploading(false);
  };

  const togglePaid = async (gallery: any) => {
    await fetch(`${API_URL}/galleries/${gallery.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaid: !gallery.isPaid }),
    });
    fetchGalleries();
  };

  const deleteGallery = async (id: string) => {
    if (confirm('Delete this gallery?')) {
      await fetch(`${API_URL}/galleries/${id}`, { method: 'DELETE' });
      fetchGalleries();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">MR.K Visuals Admin</h1>
            <span className="text-xs bg-black text-white px-3 py-1 rounded-full">Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm">+ New Gallery</button>
            <button onClick={handleLogout} className="text-gray-500 hover:text-black text-sm">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <h2 className="text-2xl font-light mb-6">Create New Gallery</h2>
            <form onSubmit={handleCreateGallery} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" value={newGallery.title} onChange={e => setNewGallery({...newGallery, title: e.target.value})} className="w-full border rounded-xl px-4 py-3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input type="date" value={newGallery.date} onChange={e => setNewGallery({...newGallery, date: e.target.value})} className="w-full border rounded-xl px-4 py-3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input type="text" value={newGallery.password} onChange={e => setNewGallery({...newGallery, password: e.target.value})} className="w-full border rounded-xl px-4 py-3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                  <select value={newGallery.privacy} onChange={e => setNewGallery({...newGallery, privacy: e.target.value})} className="w-full border rounded-xl px-4 py-3">
                    <option value="private">Private (Link + Password)</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                {newGallery.privacy === 'private' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
                    <input type="email" value={newGallery.clientEmail} onChange={e => setNewGallery({...newGallery, clientEmail: e.target.value})} className="w-full border rounded-xl px-4 py-3" placeholder="client@email.com" />
                  </div>
                )}
              </div>

              {/* Pricing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Type</label>
                <div className="flex gap-4">
                  {['full', 'per-photo', 'installment'].map(type => (
                    <button key={type} type="button" onClick={() => setPricingType(type)}
                      className={`px-4 py-2 rounded-lg text-sm ${pricingType === type ? 'bg-black text-white' : 'bg-gray-100'}`}>
                      {type === 'full' ? 'Full Gallery' : type === 'per-photo' ? 'Per Photo' : 'Installment'}
                    </button>
                  ))}
                </div>
              </div>

              {pricingType === 'full' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Price (GHS)</label>
                  <input type="number" value={newGallery.price} onChange={e => setNewGallery({...newGallery, price: e.target.value})} className="w-full border rounded-xl px-4 py-3" required />
                </div>
              )}

              {pricingType === 'per-photo' && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Set price for each photo after uploading</p>
                </div>
              )}

              {pricingType === 'installment' && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">Installment Parts</p>
                  {installmentParts.map((part, i) => (
                    <div key={i} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl">
                      <input type="text" value={part.label} onChange={e => {
                        const updated = [...installmentParts];
                        updated[i].label = e.target.value;
                        setInstallmentParts(updated);
                      }} className="border rounded-lg px-3 py-2 w-32" placeholder="Part name" />
                      <input type="number" value={part.amount} onChange={e => {
                        const updated = [...installmentParts];
                        updated[i].amount = parseFloat(e.target.value);
                        setInstallmentParts(updated);
                      }} className="border rounded-lg px-3 py-2 w-32" placeholder="GHS" />
                      <input type="number" value={part.photosToShow} onChange={e => {
                        const updated = [...installmentParts];
                        updated[i].photosToShow = parseInt(e.target.value);
                        setInstallmentParts(updated);
                      }} className="border rounded-lg px-3 py-2 w-32" placeholder="Photos to show" />
                      <button type="button" onClick={() => setInstallmentParts(installmentParts.filter((_, j) => j !== i))} className="text-red-500">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setInstallmentParts([...installmentParts, { amount: 0, label: `Part ${installmentParts.length + 1}`, photosToShow: 5 }])} className="text-sm text-blue-600">+ Add Part</button>
                </div>
              )}

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos *</label>
                {newGallery.photos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                    {newGallery.photos.map((photo, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                        {pricingType === 'per-photo' && (
                          <input type="number" placeholder="GHS" value={photoPrices[i] || 0} onChange={e => {
                            const updated = [...photoPrices];
                            updated[i] = parseFloat(e.target.value);
                            setPhotoPrices(updated);
                          }} className="absolute bottom-1 left-1 right-1 bg-white/90 rounded px-2 py-1 text-xs" />
                        )}
                        <button type="button" onClick={() => {
                          setNewGallery({...newGallery, photos: newGallery.photos.filter((_, j) => j !== i)});
                          setPhotoPrices(photoPrices.filter((_, j) => j !== i));
                        }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-black">
                  <p className="text-4xl mb-2">📁</p>
                  <p className="font-medium">Click to upload photos</p>
                  <p className="text-gray-400 text-sm">{newGallery.photos.length} selected</p>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={uploading} className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 disabled:bg-gray-400">
                  {uploading ? 'Creating...' : 'Create Gallery'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="text-gray-500 px-6 py-3">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery List */}
        <h2 className="text-2xl font-light mb-6">Galleries ({galleries.length})</h2>
        {galleries.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <p className="text-6xl mb-4">📁</p>
            <p className="text-gray-500">No galleries yet</p>
            <button onClick={() => setShowCreateForm(true)} className="bg-black text-white px-6 py-3 rounded-xl mt-4">Create First Gallery</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map(gallery => (
              <div key={gallery.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  <img src={gallery.coverImage} alt={gallery.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-full">{gallery.photos.length} photos</span>
                  <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded-full ${gallery.privacy === 'private' ? 'bg-yellow-400 text-black' : 'bg-green-400 text-black'}`}>
                    {gallery.privacy}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{gallery.title}</h3>
                  <p className="text-gray-500 text-sm">{gallery.date}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">
                      {gallery.pricingType === 'full' ? `GHS ${gallery.price}` : 
                       gallery.pricingType === 'per-photo' ? 'Per Photo' : 'Installment'}
                    </span>
                    <button onClick={() => togglePaid(gallery)} className={`text-xs px-3 py-1 rounded-full ${gallery.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {gallery.isPaid ? 'Paid ✅' : 'Unpaid ⏳'}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <a href={`/gallery/${gallery.slug}`} target="_blank" className="flex-1 text-center text-sm border rounded-lg py-2 hover:bg-gray-50">View</a>
                    <button onClick={() => { navigator.clipboard.writeText(`https://www.mrkvisualsgh.com/gallery/${gallery.slug}`); alert('Link copied!'); }} className="flex-1 text-sm border rounded-lg py-2 hover:bg-gray-50">Copy Link</button>
                    <button onClick={() => deleteGallery(gallery.id)} className="text-red-500 px-2">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}