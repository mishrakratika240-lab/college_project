import React, { useState } from 'react';
import { Lock, User, KeyRound, ArrowRight } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      onLoginSuccess(data.token);
    } catch (err) {
      setError(err.message || 'Invalid admin username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', padding: '2.5rem' }} className="glass-card">
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Lock size={30} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Admin Portal Login</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Sign in to manage faculties, subjects, and view consolidated evaluation reports.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
            Username
          </label>
          <div style={{ position: 'relative' }}>
            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }} disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In as Admin'} <ArrowRight size={18} />
        </button>
      </form>
    </div>

    </div>
  );
}
