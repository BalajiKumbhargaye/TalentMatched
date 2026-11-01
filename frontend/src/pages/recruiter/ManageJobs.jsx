import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchRecruiterJobs,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
} from '../../services/api';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import JobModal from '../../components/JobModal';
import SkillTag from '../../components/SkillTag';

export default function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [savingJob, setSavingJob] = useState(false);
  const [alert, setAlert] = useState(null);

  const loadJobs = async () => {
    try {
      const res = await fetchRecruiterJobs();
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
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
      await loadJobs();
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Operation failed.' });
    } finally {
      setSavingJob(false);
    }
  };

  const handleDeleteJob = async (jobId, reason) => {
    const confirmMsg = reason
      ? `This opening is ${reason}. Confirm deletion?`
      : 'Are you sure you want to permanently delete this job opening?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await deleteJobOpening(jobId);
      if (res.success) {
        setAlert({ type: 'success', text: 'Job opening successfully deleted.' });
        await loadJobs();
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Failed to delete job opening.' });
    }
  };

  // Filter jobs based on active tab
  const filteredJobs = jobs.filter((j) => {
    if (filterTab === 'Active') return j.status === 'Active' && !j.isExpired && !j.isFullyFilled;
    if (filterTab === 'Fulfilled') return j.isFullyFilled || j.status === 'Filled';
    if (filterTab === 'Expired') return j.isExpired;
    return true;
  });

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Manage Job Openings</h1>
            <p className="page-subtitle">
              Create, update required skills, monitor vacancies, or delete expired/fulfilled openings.
            </p>
          </div>
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <PlusCircle size={18} /> Post New Job Opening
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

      {/* Tabs Filter */}
      <div className="tabs-nav">
        {['All', 'Active', 'Fulfilled', 'Expired'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`tab-btn ${filterTab === tab ? 'active' : ''}`}
          >
            {tab} Openings ({
              tab === 'All'
                ? jobs.length
                : tab === 'Active'
                ? jobs.filter((j) => j.status === 'Active' && !j.isExpired && !j.isFullyFilled).length
                : tab === 'Fulfilled'
                ? jobs.filter((j) => j.isFullyFilled || j.status === 'Filled').length
                : jobs.filter((j) => j.isExpired).length
            })
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading your job postings...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Layers size={44} color="#818cf8" style={{ marginBottom: '1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Jobs in this View</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            {filterTab === 'All'
              ? 'You have not posted any openings yet. Create your first opening to attract 85%+ matched candidates.'
              : `No openings currently match the '${filterTab}' status tab.`}
          </p>
          <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> Post Opening Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredJobs.map((job) => {
            const deadlineDate = new Date(job.deadline);
            const now = new Date();
            const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
            const isExpired = diffDays < 0;
            const isFulfilled = job.filledPositions >= job.maxPositions;

            return (
              <div key={job._id} className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span className="badge badge-domain">{job.domain}</span>
                      <span className="badge badge-role-tag">{job.jobType}</span>

                      {/* Explicit fulfilled & expired badges as required */}
                      {isFulfilled && (
                        <span className="badge badge-eligible">
                          Selections Fulfilled ({job.filledPositions}/{job.maxPositions})
                        </span>
                      )}
                      {isExpired && (
                        <span className="badge badge-danger">
                          Deadline Passed (Expired)
                        </span>
                      )}
                      {!isExpired && !isFulfilled && (
                        <span className="badge badge-eligible">Active</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.35rem' }}>{job.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '3px', flexWrap: 'wrap' }}>
                      <span><strong>Role:</strong> {job.role}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <MapPin size={13} color="#67e8f9" /> {job.location}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <DollarSign size={13} color="#34d399" /> {job.salary}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Calendar size={13} color="#fbbf24" /> Deadline: {new Date(job.deadline).toLocaleDateString()} ({isExpired ? 'Expired' : `${diffDays} days left`})
                      </span>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button
                      onClick={() => navigate(`/recruiter/applicants?jobId=${job._id}`)}
                      className="btn btn-sm btn-secondary"
                    >
                      <Users size={16} /> Applicants ({job.applicantCount || 0})
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(job)}
                      className="btn btn-sm btn-secondary"
                      title="Update job description, required skills, and openings"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id, isExpired ? 'expired' : isFulfilled ? 'fulfilled' : '')}
                      className="btn btn-sm btn-danger"
                      title={isExpired || isFulfilled ? 'Deadline passed or selections fulfilled: Safe to delete' : 'Delete opening'}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>

                {/* Job Description Preview */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                  {job.description}
                </p>

                {/* Required Skills Chips */}
                <div style={{
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Evaluated Skills:
                    </span>
                    {job.requiredSkills?.map((s) => (
                      <SkillTag key={s} name={s} size="sm" />
                    ))}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Openings: <strong>{job.maxPositions - job.filledPositions}</strong> remaining of {job.maxPositions}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
