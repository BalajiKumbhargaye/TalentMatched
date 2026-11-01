import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  fetchRecruiterJobs,
  fetchRecruiterApplicants,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
} from '../../services/api';
import {
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Building2,
  Calendar,
} from 'lucide-react';
import JobModal from '../../components/JobModal';
import SkillTag from '../../components/SkillTag';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Job Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [savingJob, setSavingJob] = useState(false);
  const [alert, setAlert] = useState(null);

  const loadRecruiterData = async () => {
    try {
      const [jobsRes, applicantsRes] = await Promise.all([
        fetchRecruiterJobs(),
        fetchRecruiterApplicants(),
      ]);

      if (jobsRes.success) setJobs(jobsRes.jobs || []);
      if (applicantsRes.success) setApplicants(applicantsRes.applications || []);
    } catch (err) {
      console.error('Failed to load recruiter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleJobSubmit = async (formData) => {
    setSavingJob(true);
    setAlert(null);
    try {
      if (editingJob) {
        const res = await updateJobOpening(editingJob._id, formData);
        if (res.success) {
          setAlert({ type: 'success', text: 'Job opening updated successfully!' });
        }
      } else {
        const res = await createJobOpening(formData);
        if (res.success) {
          setAlert({ type: 'success', text: 'Job opening published successfully!' });
        }
      }
      setIsModalOpen(false);
      await loadRecruiterData();
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setSavingJob(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job opening?')) return;
    try {
      const res = await deleteJobOpening(jobId);
      if (res.success) {
        setAlert({ type: 'success', text: 'Job opening removed.' });
        await loadRecruiterData();
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Failed to delete job.' });
    }
  };

  // Metrics
  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalApplicantsCount = applicants.length;
  const shortlistedCount = applicants.filter((a) => a.status === 'Shortlisted').length;
  const acceptedCount = applicants.filter((a) => a.status === 'Accepted').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Recruiter Control Hub</h1>
            <p className="page-subtitle">
              Managing hiring for <strong style={{ color: '#fff' }}>{user?.companyName || 'Your Organization'}</strong>
            </p>
          </div>
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <PlusCircle size={18} /> Post New Opening
          </button>
        </div>
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

      {/* Recruiter Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="stat-value">{activeJobsCount}</div>
            <div className="stat-label">Active Job Openings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{totalApplicantsCount}</div>
            <div className="stat-label">Verified Applicants (&ge;85%)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{shortlistedCount}</div>
            <div className="stat-label">Shortlisted Candidates</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">{acceptedCount}</div>
            <div className="stat-label">Filled / Hired Candidates</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Applicants & Jobs Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.3fr) minmax(320px, 1fr)',
        gap: '2rem',
        marginBottom: '2.5rem',
      }}>
        {/* Left Column: Recent Applicants (Qualified at 85%+) */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>High-Match Candidate Inflow</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                All applicants verified to match &ge;85% of your mandatory skills.
              </p>
            </div>
            <Link to="/recruiter/applicants" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
              Review All ({applicants.length}) &rarr;
            </Link>
          </div>

          {applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No candidates have applied yet. Ensure your job openings are active and have reasonable skill requirements.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {applicants.slice(0, 4).map((app) => (
                <div
                  key={app._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
                        {app.student?.name}
                      </span>
                      <span className="badge badge-eligible" style={{ fontSize: '0.75rem' }}>
                        {app.matchPercentage}% Match
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Applied for: <strong>{app.job?.title}</strong> • {app.student?.email}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className={`badge ${
                      app.status === 'Accepted'
                        ? 'badge-eligible'
                        : app.status === 'Shortlisted'
                        ? 'badge-domain'
                        : app.status === 'Rejected'
                        ? 'badge-danger'
                        : 'badge-locked'
                    }`}>
                      {app.status}
                    </span>
                    <button
                      onClick={() => navigate(`/recruiter/applicants?jobId=${app.job?._id}`)}
                      className="btn btn-sm btn-secondary"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Openings Summary */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Active Openings ({jobs.length})</h3>
            <Link to="/recruiter/jobs" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
              Manage All &rarr;
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              No openings posted yet. Click <strong>Post New Opening</strong> to get started.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {jobs.slice(0, 3).map((job) => (
                <div
                  key={job._id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{job.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {job.domain} • Openings: {job.maxPositions - job.filledPositions} of {job.maxPositions}
                      </div>
                    </div>
                    <span className={`badge ${job.status === 'Active' ? 'badge-eligible' : 'badge-danger'}`}>
                      {job.status}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    paddingTop: '0.6rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                  }}>
                    <span>Applicants: <strong>{job.applicantCount || 0}</strong></span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEditModal(job)}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="btn btn-sm btn-danger"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating or Editing Job */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleJobSubmit}
        initialJob={editingJob}
        saving={savingJob}
      />
    </div>
  );
}
