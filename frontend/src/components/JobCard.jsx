import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Lock,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import MatchIndicator from './MatchIndicator';
import SkillTag from './SkillTag';

export default function JobCard({
  job,
  onApply,
  onImprove,
  onEdit,
  onDelete,
  applying = false,
}) {
  const { user, isStudent, isRecruiter } = useAuth();
  const navigate = useNavigate();

  const matchData = job.matchScore || null;
  const matchPercentage = matchData?.matchPercentage ?? 0;
  const isEligible = matchData?.isEligible ?? false;
  const matchedSkillsSet = new Set((matchData?.matchedSkills || []).map((s) => s.toLowerCase()));

  // Calculate days remaining to deadline
  const deadlineDate = new Date(job.deadline);
  const now = new Date();
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffDays < 0;

  const isFilled = job.filledPositions >= job.maxPositions;

  return (
    <div className={`glass-card job-card ${isStudent ? (isEligible ? 'eligible' : 'needs-improvement') : ''}`}>
      <div>
        {/* Top Header */}
        <div className="job-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-domain">{job.domain}</span>
              <span className="badge badge-role-tag">{job.jobType}</span>
              {isExpired && <span className="badge badge-danger">Expired</span>}
              {isFilled && <span className="badge badge-locked">Selections Filled</span>}
            </div>
            <h3 className="job-title">{job.title}</h3>
            <div className="job-company" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '3px' }}>
              <Building2 size={15} color="var(--primary-light)" /> {job.company}
            </div>
          </div>

          {/* Match Score Indicator (Shown for Students) */}
          {isStudent && (
            <MatchIndicator
              percentage={matchPercentage}
              isEligible={isEligible}
              showBadge={false}
              size={54}
            />
          )}
        </div>

        {/* Metadata info row */}
        <div className="job-meta-row">
          <span className="job-meta-item">
            <MapPin size={14} color="#67e8f9" /> {job.location || 'Remote'}
          </span>
          <span className="job-meta-item">
            <DollarSign size={14} color="#34d399" /> {job.salary || 'Competitive'}
          </span>
          <span className="job-meta-item">
            <Users size={14} color="#a5b4fc" /> Openings: {job.maxPositions - job.filledPositions} of {job.maxPositions}
          </span>
          <span className="job-meta-item">
            <Calendar size={14} color="#fbbf24" />{' '}
            {isExpired ? 'Ended' : `${diffDays} days left`}
          </span>
        </div>

        {/* Description snippet */}
        <p className="job-desc-snippet">{job.description}</p>

        {/* Required Skills Section */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Required Skills ({job.requiredSkills?.length || 0})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {job.requiredSkills?.map((skill) => {
              let status = 'neutral';
              if (isStudent && matchData) {
                status = matchedSkillsSet.has(skill.toLowerCase()) ? 'matched' : 'missing';
              }
              return <SkillTag key={skill} name={skill} status={status} size="sm" />;
            })}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        {/* Student View Controls */}
        {isStudent && (
          <>
            <div>
              {job.hasApplied ? (
                <span className="badge badge-eligible" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <CheckCircle size={15} /> Applied ({job.applicationStatus || 'In Review'})
                </span>
              ) : isEligible ? (
                <span className="badge badge-eligible">
                  <CheckCircle size={14} /> Ready ({matchPercentage}% Match)
                </span>
              ) : (
                <span className="badge badge-locked">
                  <Lock size={14} /> {matchPercentage}% Match (&lt; 85%)
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {job.hasApplied ? (
                <button
                  disabled
                  className="btn btn-sm btn-secondary"
                  style={{ opacity: 0.7 }}
                >
                  Application Submitted
                </button>
              ) : isEligible ? (
                <button
                  onClick={() => onApply(job._id)}
                  disabled={applying || isExpired || isFilled}
                  className="btn btn-sm btn-emerald"
                  title="Your skills meet the 85% requirement. Apply now!"
                >
                  {applying ? 'Submitting...' : 'Apply Now (85%+ Match)'}
                </button>
              ) : (
                <button
                  onClick={() => onImprove(job)}
                  className="btn btn-sm btn-secondary"
                  style={{
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: '#fbbf24',
                    background: 'rgba(245, 158, 11, 0.08)',
                  }}
                  title="Review areas needing improvement to unlock the 85% requirement"
                >
                  <TrendingUp size={15} /> Areas to Improve
                </button>
              )}
            </div>
          </>
        )}

        {/* Recruiter View Controls */}
        {isRecruiter && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Applicants: <strong>{job.applicantCount || 0}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {onEdit && (
                <button
                  onClick={() => onEdit(job)}
                  className="btn btn-sm btn-secondary"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(job._id)}
                  className="btn btn-sm btn-danger"
                  title={isExpired || isFilled ? 'Can delete: criteria fulfilled or expired' : 'Delete opening'}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* Guest View Controls */}
        {!user && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Sign in as Student to check match %
            </span>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-sm btn-primary"
            >
              Sign In to Apply <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
