import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import StudentPortal from './components/StudentPortal.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

export default function App() {
  const [activeView, setActiveView] = useState('student'); // 'student', 'login', 'admin'
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || '');

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('admin_token', adminToken);
    } else {
      localStorage.removeItem('admin_token');
    }
  }, [adminToken]);

  const handleLoginSuccess = (token) => {
    setAdminToken(token);
    setActiveView('admin');
  };

  const handleLogout = () => {
    setAdminToken('');
    setActiveView('student');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        adminToken={adminToken}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeView === 'student' && <StudentPortal />}
        {activeView === 'login' && (
          adminToken ? (
            <AdminDashboard adminToken={adminToken} />
          ) : (
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          )
        )}
        {activeView === 'admin' && (
          adminToken ? (
            <AdminDashboard adminToken={adminToken} />
          ) : (
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          )
        )}
      </main>

      {/* Footer Credit */}
      <footer className="no-print" style={{ borderTop: '1px solid var(--bg-card-border)', background: 'rgba(15, 23, 42, 0.95)', padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            © {new Date().getFullYear()} <strong>Jagran Institute of Management</strong> • Student Feedback System (PERN Stack)
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.4rem 1rem', borderRadius: '30px', color: '#c7d2fe', fontWeight: 600 }}>
            Developed by <strong style={{ color: '#fff' }}>Er. Kratika Mishra (MCA)</strong>
          </div>
        </div>
      </footer>

    </div>
  );
}
