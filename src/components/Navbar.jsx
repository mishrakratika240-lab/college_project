import React from 'react';
import { GraduationCap, ShieldCheck, UserCheck, LogOut } from 'lucide-react';

export default function Navbar({ activeView, setActiveView, adminToken, onLogout }) {
  return (
    <header style={{ borderBottom: '1px solid var(--bg-card-border)', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', sticky: 'top', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.6rem', borderRadius: '12px', display: 'flex' }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Student Feedback System
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Anonymous Faculty Evaluation • MCA Semesters 1 - 4
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className={activeView === 'student' ? 'btn-primary' : 'btn-outline'} 
            onClick={() => setActiveView('student')}
          >
            <UserCheck size={18} />
            Student Feedback
          </button>

          {adminToken ? (
            <>
              <button 
                className={activeView === 'admin' ? 'btn-primary' : 'btn-outline'} 
                onClick={() => setActiveView('admin')}
              >
                <ShieldCheck size={18} />
                Admin Dashboard
              </button>
              <button className="btn-danger" onClick={onLogout} title="Logout Admin">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <button 
              className={activeView === 'login' ? 'btn-primary' : 'btn-outline'} 
              onClick={() => setActiveView('login')}
            >
              <ShieldCheck size={18} />
              Admin Portal
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
