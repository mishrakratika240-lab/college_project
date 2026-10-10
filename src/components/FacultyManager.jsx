import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, UserCheck, Search, X } from 'lucide-react';

export default function FacultyManager({ adminToken }) {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [formData, setFormData] = useState({
    faculty_code: '',
    name: '',
    designation: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faculties');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFaculties(data);
      } else {
        setFaculties([]);
      }
    } catch (err) {
      setError('Failed to fetch faculty list.');
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({ faculty_code: '', name: '', designation: '', email: '' });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingFaculty(fac);
    setFormData({
      faculty_code: fac.faculty_code || '',
      name: fac.name || '',
      designation: fac.designation || '',
      email: fac.email || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      const res = await fetch(`/api/faculties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setMessage('Faculty deleted successfully.');
        await fetchFaculties();
      } else {
        const data = await res.json();
        setError(data.message || 'Error deleting faculty.');
      }
    } catch (err) {
      setError('Failed to delete faculty member.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const url = editingFaculty ? `/api/faculties/${editingFaculty.id}` : '/api/faculties';
      const method = editingFaculty ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Action failed.');
      }

      setMessage(editingFaculty ? 'Faculty updated successfully!' : 'Faculty added successfully!');
      setShowModal(false);
      await fetchFaculties(); // Reload list live
    } catch (err) {
      setError(err.message);
    }
  };

  const safeFaculties = Array.isArray(faculties) ? faculties : [];
  const filteredFaculties = safeFaculties.filter(f =>
    (f && f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f && f.faculty_code && f.faculty_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (f && f.designation && f.designation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Faculty Members Directory ({safeFaculties.length})</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Add, edit, or remove faculty members across MCA departments.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem', fontSize: '0.88rem' }}
              placeholder="Search faculty name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> Add Faculty Member
          </button>
        </div>
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

      {/* Faculty Data Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="rating-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Faculty Name</th>
              <th>Designation</th>
              <th>Email Address</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading faculties...</td></tr>
            ) : filteredFaculties.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No faculty members found matching your search. Click "Add Faculty Member" to create one.</td></tr>
            ) : (
              filteredFaculties.map(fac => (
                <tr key={fac.id}>
                  <td>
                    <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--primary-hover)', fontWeight: 600 }}>
                      {fac.faculty_code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{fac.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{fac.designation || 'N/A'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{fac.email || 'N/A'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button className="btn-outline" style={{ padding: '0.3rem 0.6rem' }} onClick={() => handleOpenEdit(fac)}>
                        <Edit3 size={15} /> Edit
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(fac.id)}>
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Faculty Code (Short Initials, e.g. Dr.DC, AK) *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.faculty_code}
                  onChange={(e) => setFormData({ ...formData, faculty_code: e.target.value })}
                  placeholder="e.g. Dr.DC"
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Full Faculty Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Divya Chowdhry"
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Designation
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Associate Professor"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. faculty@institution.edu"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingFaculty ? 'Save Changes' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
