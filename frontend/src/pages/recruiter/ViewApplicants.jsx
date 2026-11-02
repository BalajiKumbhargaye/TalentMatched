import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchRecruiterApplicants,
  fetchRecruiterJobs,
  updateApplicantStatus,
  getFileUrl,
} from '../../services/api';
import {
  Users,
  Award,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Filter,
  MessageSquare,
  Save,
} from 'lucide-react';
import SkillTag from '../../components/SkillTag';

export default function ViewApplicants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId') || '';

  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJobId, setFilterJobId] = useState(selectedJobId);
  const [alert, setAlert] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [notesState, setNotesState] = useState({});

  const loadData = async () => {
    try {
      const [appsRes, jobsRes] = await Promise.all([
        fetchRecruiterApplicants(filterJobId),
        fetchRecruiterJobs(),
      ]);

      if (appsRes.success) {
        setApplicants(appsRes.applications || []);
        // Initialize notes state
        const initialNotes = {};
        (appsRes.applications || []).forEach((app) => {
          initialNotes[app._id] = app.recruiterNotes || '';
        });
        setNotesState(initialNotes);
      }
      if (jobsRes.success) {
        setJobs(jobsRes.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterJobId]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    setAlert(null);
    try {
      const currentNotes = notesState[appId] || '';
      const res = await updateApplicantStatus(appId, newStatus, currentNotes);
      if (res.success) {
        setAlert({
          type: 'success',
          text: `Candidate status updated to '${newStatus}'!`,
        });
        await loadData();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        text: err.message || 'Failed to update candidate status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (appId, currentStatus) => {
    setUpdatingId(appId);
    try {
      const currentNotes = notesState[appId] || '';
      const res = await updateApplicantStatus(appId, currentStatus, currentNotes);
      if (res.success) {
        setAlert({ type: 'success', text: 'Recruiter notes saved.' });
      }
    } catch (err) {
      setAlert({ type: 'error', text: 'Failed to save notes.' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Candidate Application Review</h1>
        <p className="page-subtitle">
          Review candidates meeting the 85%+ qualification threshold with verified resume skills.
        </p>
      </div>

      {alert && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: alert.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${alert.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          color: alert.type === 'success' ? '#34d399' : '#fb7185',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{alert.text}</span>
        </div>
      )}

      {/* Filter by Job Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <Filter size={16} /> Filter by Job Opening:
          </div>
          <select
            value={filterJobId}
            onChange={(e) => {
              setFilterJobId(e.target.value);
              setSearchParams(e.target.value ? { jobId: e.target.value } : {});
            }}
            style={{ minWidth: '280px' }}
          >
            <option value="">All Job Openings ({applicants.length} Total Applicants)</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.applicantCount || 0} applicants)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading candidate applications...
        </div>
      ) : applicants.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={48} color="#818cf8" style={{ marginBottom: '1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Applicants Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto', fontSize: '0.9rem' }}>
            {filterJobId
              ? 'No candidates have applied to this specific opening yet.'
              : 'You have not received any applications yet. As qualified students discover your jobs, they will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {applicants.map((app) => {
            const student = app.student || {};
            const job = app.job || {};

            return (
              <div key={app._id} className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}>
                  {/* Candidate Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontSize: '1.35rem' }}>{student.name}</h3>
                      <span className="badge badge-eligible" style={{ fontSize: '0.82rem' }}>
                        <Sparkles size={13} /> {app.matchPercentage}% Skill Match
                      </span>
                      <span className="badge badge-domain" style={{ fontSize: '0.75rem' }}>
                        {student.experienceLevel || 'Fresher'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Applied for: <strong style={{ color: '#fff' }}>{job.title}</strong> • Domain: {job.domain}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Mail size={14} color="#a5b4fc" /> {student.email}
                      </span>
                      {student.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Phone size={14} color="#67e8f9" /> {student.phone}
                        </span>
                      )}
                      {student.education?.degree && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <GraduationCap size={14} color="#34d399" /> {student.education.degree} ({student.education.college})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resume & Status Changer */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    {student.resumeUrl ? (
                      <a
                        href={getFileUrl(student.resumeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                        style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
                      >
                        <FileText size={15} /> View Uploaded Resume <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        No Resume File Uploaded
                      </span>
                    )}

                    {/* Status Changer Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Status:</span>
                      <select
                        value={app.status}
                        disabled={updatingId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        style={{
                          background: app.status === 'Accepted'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : app.status === 'Shortlisted'
                            ? 'rgba(99, 102, 241, 0.2)'
                            : app.status === 'Rejected'
                            ? 'rgba(244, 63, 94, 0.2)'
                            : 'rgba(15, 23, 42, 0.9)',
                          borderColor: app.status === 'Accepted'
                            ? '#10b981'
                            : app.status === 'Shortlisted'
                            ? '#6366f1'
                            : app.status === 'Rejected'
                            ? '#f43f5e'
                            : 'var(--border-subtle)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          padding: '6px 12px',
                        }}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Accepted">Accepted (Fill Opening)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Candidate Extracted Skills Breakdown */}
                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Candidate Verified Skills:
                    </span>
                    {(student.skills || []).map((skill) => (
                      <SkillTag
                        key={skill}
                        name={skill}
                        status={app.matchedSkills?.includes(skill) ? 'matched' : 'neutral'}
                        size="sm"
                      />
                    ))}
                  </div>

                  {/* Recruiter Notes / Interview Feedback */}
                  <div style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <MessageSquare size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Add recruiter notes (e.g. Passed technical round, salary expectation...)"
                      value={notesState[app._id] || ''}
                      onChange={(e) => setNotesState({ ...notesState, [app._id]: e.target.value })}
                      style={{ flex: 1, fontSize: '0.85rem', padding: '6px 10px' }}
                    />
                    <button
                      onClick={() => handleSaveNotes(app._id, app.status)}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '0.4rem 0.8rem' }}
                    >
                      <Save size={14} /> Save Note
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
