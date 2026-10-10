import React, { useState, useEffect } from 'react';
import { KeyRound, Plus, Trash2, Copy, Check, Clock, ShieldCheck, RefreshCw } from 'lucide-react';

export default function PasscodeManager({ adminToken }) {
  const [tokens, setTokens] = useState([]);
  const [selectedSemFilter, setSelectedSemFilter] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 10000); // refresh timer status every 10s
    return () => clearInterval(interval);
  }, [selectedSemFilter]);

  const fetchTokens = async () => {
    try {
      const res = await fetch(`/api/passcodes?semester=${selectedSemFilter}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      setTokens(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch session passcodes. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/passcodes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          semester: selectedSemFilter,
          duration_minutes: durationMinutes,
          custom_code: customCode
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create session passcode.');

      setMessage(data.message);
      setCustomCode('');
      fetchTokens();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session passcode?')) return;
    try {
      const res = await fetch(`/api/passcodes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setMessage('Passcode deleted.');
        fetchTokens();
      }
    } catch (err) {
      setError('Failed to delete passcode.');
    }
  };

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRemainingTimeText = (expiresAtStr) => {
    const expiresAt = new Date(expiresAtStr).getTime();
    const diff = Math.floor((expiresAt - Date.now()) / 1000);
    if (diff <= 0) return { text: '🔴 Expired', active: false };
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return { text: `🟢 Active (${mins}m ${secs}s left)`, active: true };
  };

  return (
    <div>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={24} color="var(--primary)" /> Class Session Passcode Generator
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Create 1 Common Session Passcode for an entire MCA Semester class with a validity timer. All students use this code during the timer window.
          </p>
        </div>

        <button className="btn-outline" onClick={fetchTokens}>
          <RefreshCw size={16} /> Refresh Status
        </button>
      </div>

      {/* Generator Card */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Create Active Session Passcode</h3>
        
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Target MCA Semester
            </label>
            <select
              className="form-control"
              style={{ minWidth: '180px' }}
              value={selectedSemFilter}
              onChange={(e) => setSelectedSemFilter(parseInt(e.target.value))}
            >
              <option value={1}>MCA Semester 1</option>
              <option value={2}>MCA Semester 2</option>
              <option value={3}>MCA Semester 3</option>
              <option value={4}>MCA Semester 4</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Validity Duration (Timer)
            </label>
            <select
              className="form-control"
              style={{ minWidth: '160px' }}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            >
              <option value={5}>5 Minutes</option>
              <option value={10}>10 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour (60 Mins)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Custom Code (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              style={{ width: '180px', textTransform: 'uppercase' }}
              placeholder="e.g. MCA1-EXAM"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={generating}>
            <Plus size={18} /> {generating ? 'Creating...' : `Create ${durationMinutes}-Min Passcode`}
          </button>
        </form>
      </div>

      {message && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      {/* Passcode List Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="rating-table">
          <thead>
            <tr>
              <th>Session Passcode</th>
              <th>Semester</th>
              <th>Timer Window</th>
              <th>Timer Countdown & Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading passcodes...</td></tr>
            ) : tokens.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No passcodes generated for MCA Semester {selectedSemFilter} yet. Click "Create Passcode" above.</td></tr>
            ) : (
              tokens.map(tok => {
                const rem = getRemainingTimeText(tok.expires_at);

                return (
                  <tr key={tok.id}>
                    <td>
                      <span style={{ padding: '0.35rem 0.85rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', fontSize: '1rem', color: '#fff', fontWeight: 800, letterSpacing: '0.08em' }}>
                        {tok.passcode}
                      </span>
                    </td>
                    <td>MCA Sem {tok.semester}</td>
                    <td>{tok.duration_seconds ? Math.round(tok.duration_seconds / 60) : 15} Mins</td>
                    <td>
                      {rem.active ? (
                        <span style={{ padding: '0.25rem 0.65rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                          {rem.text}
                        </span>
                      ) : (
                        <span style={{ padding: '0.25rem 0.65rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                          {rem.text}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="btn-outline" style={{ padding: '0.3rem 0.6rem' }} onClick={() => copyToClipboard(tok.passcode, tok.id)}>
                          {copiedId === tok.id ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                          {copiedId === tok.id ? 'Copied' : 'Copy'}
                        </button>
                        <button className="btn-danger" onClick={() => handleDelete(tok.id)}>
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
