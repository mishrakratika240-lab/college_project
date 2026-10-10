import React, { useState } from 'react';
import { Users, BookOpen, BarChart3, ShieldCheck, KeyRound } from 'lucide-react';
import FacultyManager from './FacultyManager.jsx';
import SubjectManager from './SubjectManager.jsx';
import ReportViewer from './ReportViewer.jsx';
import PasscodeManager from './PasscodeManager.jsx';

export default function AdminDashboard({ adminToken }) {
  const [activeTab, setActiveTab] = useState('reports'); // 'reports', 'passcodes', 'faculties', 'subjects'

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* Admin Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={28} color="var(--primary)" />
            Admin Control Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage student access passcodes, faculty profiles, subject mappings, and analyze Mode rating reports.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card" style={{ display: 'inline-flex', padding: '0.3rem', gap: '0.3rem', flexWrap: 'wrap' }}>
          <button
            className={activeTab === 'reports' ? 'btn-primary' : 'btn-outline'}
            style={{ border: 'none', padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={17} /> Consolidated Reports
          </button>

          <button
            className={activeTab === 'passcodes' ? 'btn-primary' : 'btn-outline'}
            style={{ border: 'none', padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('passcodes')}
          >
            <KeyRound size={17} /> Student Passcodes
          </button>

          <button
            className={activeTab === 'faculties' ? 'btn-primary' : 'btn-outline'}
            style={{ border: 'none', padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('faculties')}
          >
            <Users size={17} /> Manage Faculties
          </button>

          <button
            className={activeTab === 'subjects' ? 'btn-primary' : 'btn-outline'}
            style={{ border: 'none', padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
            onClick={() => setActiveTab('subjects')}
          >
            <BookOpen size={17} /> Subject Mapping
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === 'reports' && <ReportViewer adminToken={adminToken} />}
        {activeTab === 'passcodes' && <PasscodeManager adminToken={adminToken} />}
        {activeTab === 'faculties' && <FacultyManager adminToken={adminToken} />}
        {activeTab === 'subjects' && <SubjectManager adminToken={adminToken} />}
      </div>

    </div>
  );
}
