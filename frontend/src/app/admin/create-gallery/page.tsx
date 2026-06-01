'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'https://mrk-visuals-api.onrender.com/api';

export default function CreateGallery() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [password, setPassword] = useState('');
  const [privacy, setPrivacy] = useState('private');
  const [clientEmail, setClientEmail] = useState('');
  const [pricingType, setPricingType] = useState('full');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) return alert('Please add photos');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('date', date);
    formData.append('price', price);
    formData.append('password', password);
    formData.append('privacy', privacy);
    formData.append('clientEmail', clientEmail);
    formData.append('pricingType', pricingType);
    photos.forEach(p => formData.append('photos', p));

    try {
      const res = await fetch(`${API_URL}/galleries`, { method: 'POST', body: formData });
      if (res.ok) {
        alert('Gallery created!');
        router.push('/admin/dashboard');
      } else {
        alert('Failed to create gallery');
      }
    } catch (error) {
      alert('Error creating gallery');
    }
    setUploading(false);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <div style={{ marginBottom: 30 }}>
        <a href="/admin/dashboard" style={{ color: '#666', textDecoration: 'none', fontSize: 14 }}>← Back</a>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginTop: 10 }}>New Gallery</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Price (GHS) *</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} required
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Password *</label>
              <input type="text" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Privacy</label>
              <select value={privacy} onChange={e => setPrivacy(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          {privacy === 'private' && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Client Email</label>
              <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Pricing Type</label>
            <select value={pricingType} onChange={e => setPricingType(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}>
              <option value="full">Full Gallery</option>
              <option value="per-photo">Per Photo</option>
              <option value="installment">Installment</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 5 }}>Photos *</label>
            {photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 10 }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 6, overflow: 'hidden' }}>
                    <img src={URL.createObjectURL(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                      style={{ position: 'absolute', top: 2, right: 2, background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 12, cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed #ddd', borderRadius: 8, padding: 30, textAlign: 'center', cursor: 'pointer' }}>
              <p style={{ fontSize: 24, marginBottom: 5 }}>📁</p>
              <p style={{ fontSize: 13, color: '#666' }}>Click to upload photos</p>
              <p style={{ fontSize: 12, color: '#999' }}>{photos.length} selected</p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          </div>

          <button type="submit" disabled={uploading}
            style={{ width: '100%', padding: 14, background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 500, opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Creating...' : 'Create Gallery'}
          </button>
        </div>
      </form>
    </div>
  );
}