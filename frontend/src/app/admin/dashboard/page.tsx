'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newGallery, setNewGallery] = useState({
    title: '',
    date: '',
    price: '',
    password: '',
    photos: [] as File[],
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      router.push('/admin/login');
    }
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/galleries`);
      const data = await res.json();
      setGalleries(data);
    } catch (error) {
      console.error('Failed to fetch galleries:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewGallery({ ...newGallery, photos: [...newGallery.photos, ...files] });
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = newGallery.photos.filter((_, i) => i !== index);
    setNewGallery({ ...newGallery, photos: updated });
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
      
      newGallery.photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const res = await fetch(`${API_URL}/galleries`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Gallery created successfully!');
        setNewGallery({
          title: '',
          date: '',
          price: '',
          password: '',
          photos: [],
        });
        setShowCreateForm(false);
        fetchGalleries();
      } else {
        alert('Failed to create gallery');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating gallery');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery?')) {
      try {
        await fetch(`${API_URL}/galleries/${id}`, { method: 'DELETE' });
        fetchGalleries();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">MR.K Visuals Admin</h1>
            <span className="text-xs bg-black text-white px-3 py-1 rounded-full">Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              + New Gallery
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-black transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create Gallery Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-light mb-6">Create New Gallery</h2>
            
            <form onSubmit={handleCreateGallery} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Title *
                  </label>
                  <input
                    type="text"
                    value={newGallery.title}
                    onChange={(e) => setNewGallery({...newGallery, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Adwoa & Kojo Wedding"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={newGallery.date}
                    onChange={(e) => setNewGallery({...newGallery, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (GHS) *
                  </label>
                  <input
                    type="number"
                    value={newGallery.price}
                    onChange={(e) => setNewGallery({...newGallery, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Password *
                  </label>
                  <input
                    type="text"
                    value={newGallery.password}
                    onChange={(e) => setNewGallery({...newGallery, password: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="wedding2024"
                    required
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos *
                </label>
                
                {/* Selected Photos Preview */}
                {newGallery.photos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                    {newGallery.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all"
                >
                  <div className="text-4xl mb-2">📁</div>
                  <p className="text-gray-600 font-medium">Click to upload photos</p>
                  <p className="text-gray-400 text-sm">JPG, PNG, GIF, WEBP (Max 50MB each)</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {newGallery.photos.length} photo(s) selected
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading || newGallery.photos.length === 0}
                  className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Creating...' : 'Create Gallery'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-black px-6 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Galleries List */}
        <div>
          <h2 className="text-2xl font-light mb-6">
            Your Galleries ({galleries.length})
          </h2>

          {galleries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-500 mb-4">No galleries yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Create Your First Gallery
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleries.map((gallery) => (
                <div key={gallery.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={gallery.coverImage}
                      alt={gallery.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full">
                      {gallery.photos.length} photos
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1">{gallery.title}</h3>
                    <p className="text-gray-500 text-sm mb-3">
                      {new Date(gallery.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">GHS {gallery.price}</span>
                      <div className="flex items-center gap-2">
  <button
    onClick={async (e) => {
      e.stopPropagation();
      try {
        await fetch(`${API_URL}/galleries/${gallery.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPaid: !gallery.isPaid }),
        });
        fetchGalleries();
      } catch (error) {
        console.error('Error:', error);
      }
    }}
    className={`text-xs px-3 py-1 rounded-full font-medium ${
      gallery.isPaid
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {gallery.isPaid ? 'Paid ✅' : 'Unpaid ⏳'}
  </button>
</div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <a
                        href={`/gallery/${gallery.slug}`}
                        target="_blank"
                        className="flex-1 text-center text-sm border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`http://localhost:3000/gallery/${gallery.slug}`);
                          alert('Link copied!');
                        }}
                        className="flex-1 text-center text-sm border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(gallery.id)}
                        className="text-red-500 hover:text-red-700 text-sm px-3 py-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}