'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@mrkvisuals.com' && password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: '#f9f9f9', fontFamily: 'system-ui, sans-serif' 
    }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, width: 360, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 5, textAlign: 'center' }}>MR.K Visuals</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 30, textAlign: 'center' }}>Photographer Login</p>
        
        {error && <p style={{ background: '#fff0f0', color: '#d32f2f', padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 15 }}>{error}</p>}
        
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, marginBottom: 12, fontSize: 14, boxSizing: 'border-box' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, marginBottom: 20, fontSize: 14, boxSizing: 'border-box' }} />
          <button type="submit" style={{ width: '100%', padding: 12, background: '#000', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}