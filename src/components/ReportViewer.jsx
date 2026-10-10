import React, { useState, useEffect } from 'react';
import { Printer, Download, Award, FileText, CheckCircle, BarChart3 } from 'lucide-react';

export default function ReportViewer({ adminToken }) {
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport(selectedSemester);
  }, [selectedSemester]);

  const fetchReport = async (sem) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/feedback/report?semester=${sem}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error fetching report.');
      setReportData(data);
    } catch (err) {
      setError(err.message || 'Failed to load evaluation report.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `MCA-${selectedSemester}-Sem-Evaluation-Report`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Calculating Mode ratings & frequency aggregations for MCA Semester {selectedSemester}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  const { subjects, reportData: statsBySubject, totalSubmissions, parameterLabels } = reportData || {};

  return (
    <div>
      {/* Top Action Bar (Hidden during Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Consolidated Evaluation & Mode Rating Report</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Automated statistical feedback aggregation per physical institute format.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Semester Selector */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[1, 2, 3, 4].map(sem => (
              <button
                key={sem}
                className={`sem-chip ${selectedSemester === sem ? 'active' : ''}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedSemester(sem)}
              >
                MCA Sem {sem}
              </button>
            ))}
          </div>

          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={18} /> Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards (Hidden during Print) */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.75rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Student Submissions</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{totalSubmissions}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.75rem', borderRadius: '12px', color: 'var(--secondary)' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Evaluated Courses/Subjects</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{subjects?.length || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px', color: 'var(--success)' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Feedback Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>Active & Aggregated</div>
          </div>
        </div>
      </div>

      {/* Official Report Document Body */}
      <div className="glass-card" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.95)' }}>
        
        {/* Document Header */}
        <div className="print-header" style={{ textAlign: 'center', borderBottom: '2px solid var(--bg-card-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Jagran Institute of Management
          </h1>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent)', marginTop: '0.25rem' }}>
            Faculty & Course Evaluation Consolidated Report — MCA Semester {selectedSemester}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • Total Responses: {totalSubmissions}
          </p>
        </div>

        {subjects?.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No evaluation data available for MCA Semester {selectedSemester}.</p>
        ) : (
          subjects.map(subj => {
            const subjStats = statsBySubject[subj.id] || {};
            const criteriaStats = subjStats.criteria || {};
            const qual = subjStats.qualitative || {};
            const remarksList = subjStats.remarks || [];

            return (
              <div key={subj.id} className="subject-report-block" style={{ marginBottom: '2.5rem' }}>
                
                {/* Subject & Faculty Information Banner */}
                <div className="print-subject-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(99, 102, 241, 0.15)', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.05rem', marginRight: '0.75rem' }}>
                      [{subj.subject_code}]
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                      {subj.subject_name}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginRight: '0.5rem' }}>Faculty:</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{subj.faculty_name || 'N/A'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({subj.faculty_code})</span>
                  </div>
                </div>

                {/* Quantitative Ratings Frequency & Mode Calculation Table */}
                <table className="rating-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Evaluation Parameter</th>
                      <th style={{ textAlign: 'center' }}>5 (Excel)</th>
                      <th style={{ textAlign: 'center' }}>4 (V.Good)</th>
                      <th style={{ textAlign: 'center' }}>3 (Good)</th>
                      <th style={{ textAlign: 'center' }}>2 (Fair)</th>
                      <th style={{ textAlign: 'center' }}>1 (Poor)</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>AVG Score</th>
                      <th style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.2)' }}>MODE Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(parameterLabels).map(critKey => {
                      const item = criteriaStats[critKey] || { count_5: 0, count_4: 0, count_3: 0, count_2: 0, count_1: 0, total_responses: 0, average_rating: '0.00', mode_rating: 0 };

                      return (
                        <tr key={critKey}>
                          <td>{parameterLabels[critKey]}</td>
                          <td style={{ textAlign: 'center', color: '#a7f3d0' }}>{item.count_5}</td>
                          <td style={{ textAlign: 'center', color: '#ddd6fe' }}>{item.count_4}</td>
                          <td style={{ textAlign: 'center', color: '#c7d2fe' }}>{item.count_3}</td>
                          <td style={{ textAlign: 'center', color: '#fde68a' }}>{item.count_2}</td>
                          <td style={{ textAlign: 'center', color: '#fca5a5' }}>{item.count_1}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.total_responses}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{item.average_rating}</td>
                          <td style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.15)' }}>
                            <span className="mode-badge" style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'var(--success)', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>
                              {item.mode_rating || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Qualitative Satisfaction Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Take Again %: </span>
                    <strong style={{ color: 'var(--success)' }}>{qual.total_qualitative ? Math.round((qual.count_take_again / qual.total_qualitative) * 100) : 0}% YES</strong>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Overall Learning %: </span>
                    <strong style={{ color: 'var(--accent)' }}>{qual.total_qualitative ? Math.round((qual.count_learning / qual.total_qualitative) * 100) : 0}% YES</strong>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mentoring %: </span>
                    <strong style={{ color: 'var(--secondary)' }}>{qual.total_qualitative ? Math.round((qual.count_mentoring / qual.total_qualitative) * 100) : 0}% YES</strong>
                  </div>
                </div>

                {/* Student Remarks */}
                {remarksList.length > 0 && (
                  <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--primary)', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Student Remarks:</span>
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>"{remarksList[0]}"</span>
                  </div>
                )}

              </div>
            );
          })
        )}

        {/* Footer Signature Box & Developer Credit for Official Institute Record */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--bg-card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>
            <p style={{ fontWeight: 600 }}>System Developer: Er. Kratika Mishra (MCA)</p>
            <p>Report Status: Verified & Consolidated Mode Evaluation</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '200px', marginBottom: '0.4rem' }}></div>
            <p style={{ fontWeight: 600 }}>Director / HOD Signature</p>
          </div>
        </div>

      </div>

    </div>
  );
}
