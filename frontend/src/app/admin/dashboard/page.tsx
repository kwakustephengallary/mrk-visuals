'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'https://mrk-visuals-api.onrender.com/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('galleries');
  const [galleries, setGalleries] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [recentWorks, setRecentWorks] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) router.push('/admin/login');
    fetchGalleries();
    fetchPortfolio();
    fetchRecentWorks();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/all-galleries`);
      setGalleries(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`${API_URL}/portfolio`);
      setPortfolioItems(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchRecentWorks = async () => {
    try {
      const res = await fetch(`${API_URL}/recent-works`);
      setRecentWorks(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  // ====== PORTFOLIO ======
  const addPortfolioItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData();
    formData.append('title', (form.querySelector('#p-title') as HTMLInputElement).value);
    formData.append('category', (form.querySelector('#p-category') as HTMLSelectElement).value);
    
    const fileInput = form.querySelector('#p-image') as HTMLInputElement;
    if (fileInput.files?.[0]) {
      formData.append('image', fileInput.files[0]);
    }

    try {
      await fetch(`${API_URL}/portfolio`, { method: 'POST', body: formData });
      fetchPortfolio();
      form.reset();
    } catch (error) { console.error(error); }
  };

  const deletePortfolioItem = async (id: string) => {
    if (confirm('Delete this item?')) {
      await fetch(`${API_URL}/portfolio/${id}`, { method: 'DELETE' });
      fetchPortfolio();
    }
  };

  // ====== RECENT WORKS ======
  const addRecentWork = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData();
    formData.append('title', (form.querySelector('#r-title') as HTMLInputElement).value);
    formData.append('description', (form.querySelector('#r-desc') as HTMLInputElement).value);
    formData.append('link', (form.querySelector('#r-link') as HTMLInputElement).value);
    
    const fileInput = form.querySelector('#r-image') as HTMLInputElement;
    if (fileInput.files?.[0]) {
      formData.append('image', fileInput.files[0]);
    }

    try {
      await fetch(`${API_URL}/recent-works`, { method: 'POST', body: formData });
      fetchRecentWorks();
      form.reset();
    } catch (error) { console.error(error); }
  };

  const deleteRecentWork = async (id: string) => {
    if (confirm('Delete this item?')) {
      await fetch(`${API_URL}/recent-works/${id}`, { method: 'DELETE' });
      fetchRecentWorks();
    }
  };

  // ====== GALLERIES ======
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

  const tabs = [
    { id: 'galleries', label: '📸 Galleries', count: galleries.length },
    { id: 'portfolio', label: '🖼️ Portfolio', count: portfolioItems.length },
    { id: 'recent', label: '⭐ Recent Works', count: recentWorks.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">MR.K Visuals Admin</h1>
          <button onClick={handleLogout} className="text-gray-500 hover:text-black text-sm">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b pb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* ====== GALLERIES TAB ====== */}
        {activeTab === 'galleries' && (
          <div>
            {galleries.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center">
                <p className="text-6xl mb-4">📁</p>
                <p className="text-gray-500">No galleries yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map(gallery => (
                  <div key={gallery.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-100 relative">
                      <img src={gallery.coverImage} alt={gallery.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded-full">{gallery.photos?.length || 0} photos</span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg">{gallery.title}</h3>
                      <p className="text-gray-500 text-sm">{gallery.date}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold">GHS {gallery.price}</span>
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
        )}

        {/* ====== PORTFOLIO TAB ====== */}
        {activeTab === 'portfolio' && (
          <div>
            {/* Add Portfolio Form */}
            <form onSubmit={addPortfolioItem} className="bg-white rounded-2xl border p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add Portfolio Item</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <input id="p-title" type="text" placeholder="Title" className="border rounded-xl px-4 py-3" required />
                <select id="p-category" className="border rounded-xl px-4 py-3">
                  <option>Wedding</option>
                  <option>Event</option>
                  <option>Portrait</option>
                  <option>Commercial</option>
                  <option>Cinematography</option>
                </select>
                <input id="p-image" type="file" accept="image/*" className="border rounded-xl px-4 py-3" required />
              </div>
              <button type="submit" className="mt-4 bg-black text-white px-6 py-2 rounded-lg text-sm">Add to Portfolio</button>
            </form>

            {/* Portfolio Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              {portfolioItems.map((item: any) => (
                <div key={item.id} className="bg-white rounded-xl border overflow-hidden">
                  <div className="aspect-square">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                    <button onClick={() => deletePortfolioItem(item.id)} className="text-red-500 text-xs mt-2">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====== RECENT WORKS TAB ====== */}
        {activeTab === 'recent' && (
          <div>
            {/* Add Recent Work Form */}
            <form onSubmit={addRecentWork} className="bg-white rounded-2xl border p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Add Recent Work</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <input id="r-title" type="text" placeholder="Title" className="border rounded-xl px-4 py-3" required />
                <input id="r-desc" type="text" placeholder="Description" className="border rounded-xl px-4 py-3" />
                <input id="r-link" type="text" placeholder="Gallery Link (optional)" className="border rounded-xl px-4 py-3" />
                <input id="r-image" type="file" accept="image/*" className="border rounded-xl px-4 py-3" required />
              </div>
              <button type="submit" className="mt-4 bg-black text-white px-6 py-2 rounded-lg text-sm">Add Recent Work</button>
            </form>

            {/* Recent Works Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {recentWorks.map((item: any) => (
                <div key={item.id} className="bg-white rounded-2xl border overflow-hidden">
                  <div className="aspect-video">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <button onClick={() => deleteRecentWork(item.id)} className="text-red-500 text-sm mt-2">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}