'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'https://mrk-visuals-api.onrender.com/api';

export default function AdminDashboard() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<any[]>([]);
  const [tab, setTab] = useState('galleries');

  useEffect(() => {
    if (!localStorage.getItem('adminLoggedIn')) router.push('/admin/login');
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const res = await fetch(`${API_URL}/all-galleries`);
      setGalleries(await res.json());
    } catch (e) {}
  };

  const togglePaid = async (g: any) => {
    await fetch(`${API_URL}/galleries/${g.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaid: !g.isPaid }),
    });
    fetchGalleries();
  };

  const deleteGallery = async (id: string) => {
    if (confirm('Delete?')) {
      await fetch(`${API_URL}/galleries/${id}`, { method: 'DELETE' });
      fetchGalleries();
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://www.mrkvisualsgh.com/gallery/${slug}`);
    alert('Link copied!');
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, paddingBottom: 15, borderBottom: '1px solid #eee' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>MR.K Visuals</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/admin/create-gallery" style={{ background: '#000', color: '#fff', padding: '8px 16px', borderRadius: 6, textDecoration: 'none', fontSize: 14 }}>
            + New Gallery
          </a>
          <button onClick={() => { localStorage.removeItem('adminLoggedIn'); router.push('/admin/login'); }} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>
            Logout
          </button>
        </div>
      </div>

      {/* Galleries List */}
      <h2 style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>Galleries ({galleries.length})</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={{ padding: '10px 0', fontSize: 13, color: '#999' }}>GALLERY</th>
            <th style={{ padding: '10px 0', fontSize: 13, color: '#999' }}>DATE</th>
            <th style={{ padding: '10px 0', fontSize: 13, color: '#999' }}>PHOTOS</th>
            <th style={{ padding: '10px 0', fontSize: 13, color: '#999' }}>PRICE</th>
            <th style={{ padding: '10px 0', fontSize: 13, color: '#999' }}>STATUS</th>
            <th style={{ padding: '10px 0', fontSize: 13, color: '#999' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {galleries.map(g => (
            <tr key={g.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
              <td style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={g.coverImage} alt="" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                  <span style={{ fontWeight: 500 }}>{g.title}</span>
                </div>
              </td>
              <td style={{ padding: '12px 0', color: '#666', fontSize: 14 }}>{g.date}</td>
              <td style={{ padding: '12px 0', fontSize: 14 }}>{g.photos?.length || 0}</td>
              <td style={{ padding: '12px 0', fontWeight: 600 }}>GHS {g.price}</td>
              <td style={{ padding: '12px 0' }}>
                <button onClick={() => togglePaid(g)} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, border: 'none', cursor: 'pointer',
                  background: g.isPaid ? '#e8f5e9' : '#fff3e0', color: g.isPaid ? '#2e7d32' : '#e65100'
                }}>
                  {g.isPaid ? 'Paid' : 'Unpaid'}
                </button>
              </td>
              <td style={{ padding: '12px 0', display: 'flex', gap: 8 }}>
                <a href={`/gallery/${g.slug}`} target="_blank" style={{ color: '#1976d2', textDecoration: 'none', fontSize: 13 }}>View</a>
                <button onClick={() => copyLink(g.slug)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 13 }}>Copy Link</button>
                <button onClick={() => deleteGallery(g.id)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: 13 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {galleries.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>📸</p>
          <p>No galleries yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}