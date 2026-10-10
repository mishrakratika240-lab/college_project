import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Layers, X } from 'lucide-react';

export default function SubjectManager({ adminToken }) {
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedSemFilter, setSelectedSemFilter] = useState(0); // 0 = all
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    semester: 1,
    faculty_id: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedSemFilter]);

  const fetchData = async () => {
    try {
      const url = selectedSemFilter > 0 ? `/api/subjects?semester=${selectedSemFilter}` : '/api/subjects';
      const [subjRes, facRes] = await Promise.all([
        fetch(url),
        fetch('/api/faculties')
      ]);

      const subjs = await subjRes.json();
      const facs = await facRes.json();

      setSubjects(Array.isArray(subjs) ? subjs : []);
      setFaculties(Array.isArray(facs) ? facs : []);
    } catch (err) {
      setError('Failed to fetch subjects or faculties.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = async () => {
    await fetchData(); // Refresh faculty list live
    setFormData({
      subject_code: '',
      subject_name: '',
      semester: selectedSemFilter > 0 ? selectedSemFilter : 1,
      faculty_id: faculties && faculties.length > 0 ? faculties[0].id : ''
    });
    setError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject mapping?')) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setMessage('Subject mapping deleted successfully.');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Error deleting subject.');
      }
    } catch (err) {
      setError('Failed to delete subject.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
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

      setMessage('Subject added & mapped to faculty successfully!');
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>MCA Semester Subjects & Faculty Mapping</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Map subjects to MCA 1, 2, 3, and 4 semesters and assign teaching faculties.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Semester Filter */}
          <select
            className="form-control"
            style={{ minWidth: '180px' }}
            value={selectedSemFilter}
            onChange={(e) => setSelectedSemFilter(parseInt(e.target.value))}
          >
            <option value={0}>All MCA Semesters</option>
            <option value={1}>MCA Semester 1</option>
            <option value={2}>MCA Semester 2</option>
            <option value={3}>MCA Semester 3</option>
            <option value={4}>MCA Semester 4</option>
          </select>

          <button className="btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> Add New Subject
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

      {/* Subjects Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="rating-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Assigned Faculty Member</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading subject mappings...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No subjects found for selected semester filter.</td></tr>
            ) : (
              subjects.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '6px', fontSize: '0.82rem', color: '#ddd6fe', fontWeight: 600 }}>
                      MCA Sem {sub.semester}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{sub.subject_code}</td>
                  <td style={{ fontWeight: 500 }}>{sub.subject_name}</td>
                  <td>
                    {sub.faculty_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600 }}>{sub.faculty_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({sub.faculty_code})</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-danger" onClick={() => handleDelete(sub.id)}>
                      <Trash2 size={15} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Subject Modal */}
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
              Add Subject & Assign Faculty
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  MCA Semester *
                </label>
                <select
                  className="form-control"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                >
                  <option value={1}>MCA Semester 1</option>
                  <option value={2}>MCA Semester 2</option>
                  <option value={3}>MCA Semester 3</option>
                  <option value={4}>MCA Semester 4</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Subject Code (e.g., MCA 101, BMB 201) *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.subject_code}
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                  placeholder="e.g. MCA 101"
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Subject Full Title / Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.subject_name}
                  onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                  placeholder="e.g. Database Management Systems"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Assign Teaching Faculty Member
                </label>
                <select
                  className="form-control"
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                >
                  <option value="">-- Select Faculty --</option>
                  {faculties.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.faculty_code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Subject Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
