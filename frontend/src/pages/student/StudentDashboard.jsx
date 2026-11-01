import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchJobs, fetchStudentApplications, applyForJob } from '../../services/api';
import {
  Sparkles,
  Search,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  FileText,
  Lock,
} from 'lucide-react';
import ResumeUploader from '../../components/ResumeUploader';
import SkillTag from '../../components/SkillTag';
import JobCard from '../../components/JobCard';
import ImprovementModal from '../../components/ImprovementModal';

export default function StudentDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForImprovement, setSelectedJobForImprovement] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);

  const loadData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetchJobs({ status: 'Active' }),
        fetchStudentApplications(),
      ]);

      if (jobsRes.success) setJobs(jobsRes.jobs || []);
      if (appsRes.success) setApplications(appsRes.applications || []);
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setActionAlert(null);
    try {
      const res = await applyForJob(jobId);
      if (res.success) {
        setActionAlert({
          type: 'success',
          text: res.message || 'Application successfully submitted!',
        });
        await loadData();
      }
    } catch (err) {
      setActionAlert({
        type: 'error',
        text: err.data?.message || err.message || 'Failed to submit application.',
      });
    } finally {
      setApplyingId(null);
    }
  };

  const studentSkills = user?.skills || [];
  const eligibleJobs = jobs.filter((j) => j.matchScore?.isEligible);
  const recentApplications = applications.slice(0, 3);

  return (
    <div>
      {/* Welcome Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Welcome back, {user?.name || 'Student'}</h1>
            <p className="page-subtitle">
              Here is your skill profile analysis, match telemetry, and eligible job openings.
            </p>
          </div>
          <Link to="/student/jobs" className="btn btn-primary btn-sm">
            <Search size={16} /> Explore All Openings
          </Link>
        </div>
      </div>

      {actionAlert && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: actionAlert.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${actionAlert.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          color: actionAlert.type === 'success' ? '#34d399' : '#fb7185',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          {actionAlert.type === 'success' ? <CheckCircle size={18} /> : <Lock size={18} />}
          <span>{actionAlert.text}</span>
        </div>
      )}

      {/* 4 Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="stat-value">{studentSkills.length}</div>
            <div className="stat-label">Profile Skills Verified</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald">
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{eligibleJobs.length}</div>
            <div className="stat-label">Qualified Roles (&ge;85% Match)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{applications.length}</div>
            <div className="stat-label">Applications Submitted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              {user?.resumeUrl ? 'Uploaded' : 'Pending'}
            </div>
            <div className="stat-label">Resume Parser Status</div>
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.2fr)',
        gap: '1.75rem',
        marginBottom: '2.5rem',
      }}>
        {/* Left Column: Resume Uploader & Active Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ResumeUploader onSkillsExtracted={() => loadData()} />

          {/* Current Profile Skills Cloud */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Your Active Skills ({studentSkills.length})</h3>
              <Link to="/student/profile" style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>
                Manage All &rarr;
              </Link>
            </div>
            {studentSkills.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                No skills detected yet. Upload your resume above or add skills manually on your profile.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {studentSkills.map((s) => (
                  <SkillTag key={s} name={s} status="matched" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Applications Tracker & Quick Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Applications Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Application Status Tracker</h3>
              <Link to="/student/applications" style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600 }}>
                View All ({applications.length}) &rarr;
              </Link>
            </div>

            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                You have not applied to any positions yet. Explore qualified openings below!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{app.job?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {app.job?.company} • {app.matchPercentage}% match at application
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tip Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrendingUp size={18} color="#818cf8" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                How the 85% Qualification Gate Works
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Employers set required technical criteria. You qualify to submit an application when your verified profile skills match <strong>at least 85%</strong> of the job requirements. For jobs below 85%, click <em>"Areas to Improve"</em> for personalized project suggestions!
            </p>
          </div>
        </div>
      </div>

      {/* Eligible Jobs Showcase Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem' }}>Roles You Qualify to Apply For (&ge;85% Match)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Your profile skills directly meet or exceed the prerequisite criteria for these openings.
            </p>
          </div>
          <Link to="/student/jobs?onlyEligible=true" className="btn btn-secondary btn-sm">
            View All Qualified <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Calculating skill match scores...
          </div>
        ) : eligibleJobs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No active job openings currently match &ge;85% with your current skill profile.
            </p>
            <Link to="/student/jobs" className="btn btn-primary btn-sm">
              Explore All Jobs & Check Improvement Areas
            </Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {eligibleJobs.slice(0, 3).map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={handleApply}
                onImprove={(j) => setSelectedJobForImprovement(j)}
                applying={applyingId === job._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Improvement Roadmap Modal */}
      {selectedJobForImprovement && (
        <ImprovementModal
          isOpen={!!selectedJobForImprovement}
          onClose={() => setSelectedJobForImprovement(null)}
          job={selectedJobForImprovement}
          matchScore={selectedJobForImprovement.matchScore}
        />
      )}
    </div>
  );
}
