import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudentApplications } from '../../services/api';
import {
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import SkillTag from '../../components/SkillTag';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await fetchStudentApplications();
        if (res.success) {
          setApplications(res.applications || []);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return <span className="badge badge-eligible" style={{ fontSize: '0.85rem' }}><CheckCircle2 size={15} /> Accepted / Hired</span>;
      case 'Shortlisted':
        return <span className="badge badge-domain" style={{ fontSize: '0.85rem' }}><Award size={15} /> Shortlisted</span>;
      case 'Rejected':
        return <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>Application Closed</span>;
      default:
        return <span className="badge badge-locked" style={{ fontSize: '0.85rem' }}><Clock size={15} /> {status || 'Applied'}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Job Applications ({applications.length})</h1>
        <p className="page-subtitle">
          Track the review status, recruiter updates, and match scores of all positions you applied to.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading your application history...
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Layers size={48} color="#818cf8" style={{ marginBottom: '1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Submitted Applications Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
            Browse open positions. Once your verified profile skills reach &ge;85% of job requirements, you can submit an application with one click.
          </p>
          <Link to="/student/jobs" className="btn btn-primary">
            Explore Openings & Check Match Score <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {applications.map((app) => (
            <div key={app._id} className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-domain">{app.job?.domain}</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.35rem' }}>{app.job?.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '3px' }}>
                    <Building2 size={15} color="var(--primary-light)" /> {app.job?.company}
                    <span style={{ margin: '0 4px' }}>•</span>
                    <MapPin size={14} color="#67e8f9" /> {app.job?.location}
                    <span style={{ margin: '0 4px' }}>•</span>
                    <span style={{ color: '#34d399' }}>{app.job?.salary}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  {getStatusBadge(app.status)}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.82rem',
                    color: '#10b981',
                    fontWeight: 600,
                  }}>
                    <Sparkles size={13} /> {app.matchPercentage}% Qualification Match
                  </div>
                </div>
              </div>

              {/* Matched Skills at Application Time */}
              {app.matchedSkills && app.matchedSkills.length > 0 && (
                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Skills Matched:
                  </span>
                  {app.matchedSkills.map((s) => (
                    <SkillTag key={s} name={s} status="matched" size="sm" />
                  ))}
                </div>
              )}

              {/* Recruiter Notes if any */}
              {app.recruiterNotes && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                }}>
                  <strong>Recruiter Feedback:</strong> {app.recruiterNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
