import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchJobs } from '../services/api';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  FileText,
  Briefcase,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import JobCard from '../components/JobCard';
import ImprovementModal from '../components/ImprovementModal';

export default function Home() {
  const { user, isStudent, isRecruiter, login } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [selectedJobForImprovement, setSelectedJobForImprovement] = useState(null);

  useEffect(() => {
    const loadFeaturedJobs = async () => {
      try {
        const res = await fetchJobs({ status: 'Active' });
        if (res.success) {
          setJobs(res.jobs.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadFeaturedJobs();
  }, []);

  const handleQuickDemoLogin = async (role) => {
    const email = role === 'student' ? 'student@example.com' : 'recruiter@techcorp.com';
    const password = 'password123';
    const res = await login(email, password);
    if (res.success) {
      navigate(role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '3.5rem 0 2.5rem',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Glowing Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#a5b4fc',
          marginBottom: '1.5rem',
        }}>
          <Sparkles size={16} color="#818cf8" /> Powered by Automated Skill Extraction & 85% Match Engine
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: '920px',
          margin: '0 auto 1.25rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Bridge the Gap Between Your Skills and High-Paying Tech Jobs
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 2.25rem',
          lineHeight: 1.6,
        }}>
          Upload your resume for automated skill extraction. Our algorithm checks your match percentage against verified job requirements. If you match <strong style={{ color: '#10b981' }}>85%+</strong>, apply immediately! If not, receive personalized learning roadmaps to qualify.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {user ? (
            <Link
              to={isStudent ? '/student/dashboard' : '/recruiter/dashboard'}
              className="btn btn-lg btn-primary"
            >
              Go to Your {isStudent ? 'Student' : 'Recruiter'} Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-lg btn-primary">
                Join as Student <ArrowRight size={18} />
              </Link>
              <Link to="/register?role=recruiter" className="btn btn-lg btn-secondary">
                Post Jobs as Recruiter
              </Link>
            </>
          )}
        </div>

        {/* Quick Demo Login Pill Bar */}
        {!user && (
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                🚀 Quick One-Click Demo Access
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Test both Student and Recruiter dashboards with pre-seeded data:
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleQuickDemoLogin('student')}
                className="btn btn-sm btn-emerald"
                style={{ fontSize: '0.82rem' }}
              >
                Demo Student (Alex)
              </button>
              <button
                onClick={() => handleQuickDemoLogin('recruiter')}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                Demo Recruiter (TechCorp)
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4 Core Pillars Grid */}
      <section style={{ padding: '2.5rem 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Card 1 */}
          <div className="glass-card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.18)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Auto Resume Parser</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Upload any PDF/TXT resume. Our parsing engine automatically scans and extracts technical skills and adds them directly onto your profile.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.18)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <CheckCircle2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>85% Match Eligibility</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              The system calculates match scores between your profile and job openings. The "Apply Now" button unlocks only when you meet 85%+ requirements.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.18)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Improvement Roadmaps</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Below 85%? Get a customized breakdown of missing skills, core concepts to study, and portfolio project suggestions to bridge the gap.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.18)',
              color: '#22d3ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Briefcase size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Recruiter Control Center</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Recruiters get a dedicated hub to post openings, add required skills, review matched candidate profiles, and manage vacancies.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Job Openings */}
      <section style={{ padding: '2.5rem 0 4rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.85rem' }}>Live Tech Openings</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Explore available positions across Fullstack, Frontend, Backend, AI, and DevOps.
            </p>
          </div>
          <Link to="/student/jobs" className="btn btn-secondary btn-sm">
            View All Job Openings <ArrowRight size={15} />
          </Link>
        </div>

        {loadingJobs ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading available job openings...
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={() => navigate(user ? '/student/jobs' : '/login')}
                onImprove={(j) => setSelectedJobForImprovement(j)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Improvement Modal */}
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
