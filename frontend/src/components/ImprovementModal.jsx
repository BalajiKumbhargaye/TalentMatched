import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Target,
  BookOpen,
  FolderGit2,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import SkillTag from './SkillTag';

export default function ImprovementModal({ isOpen, onClose, job, matchScore }) {
  const navigate = useNavigate();

  if (!isOpen || !job) return null;

  const currentMatch = matchScore?.matchPercentage || 0;
  const missingSkills = matchScore?.missingSkills || [];
  const suggestions = matchScore?.improvementSuggestions || [];
  const totalRequired = job.requiredSkills?.length || 1;
  const neededCount = Math.max(1, Math.ceil(0.85 * totalRequired) - (matchScore?.matchedSkills?.length || 0));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Skill Gap & Improvement Roadmap</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Targeting: <strong style={{ color: '#fff' }}>{job.title}</strong> at {job.company}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Match Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(244, 63, 94, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
                Match Score: {currentMatch}% (Threshold: 85%)
              </span>
              <span className="badge badge-locked">
                <Target size={13} /> Need +{Math.max(0, 85 - currentMatch)}% to Unlock Apply
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '99px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${currentMatch}%`,
                  background: 'var(--grad-amber)',
                  borderRadius: '99px',
                  transition: 'width 0.6s ease',
                }}
              />
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.75rem', lineHeight: '1.4' }}>
              ⚠️ The <strong>Apply</strong> button is locked because this position requires an <strong>85% skill match</strong>. You need to master and add at least <strong>{neededCount} more skill{neededCount > 1 ? 's' : ''}</strong> to qualify.
            </p>
          </div>

          {/* Missing Skills Pills */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={16} color="#f43f5e" />
              Missing Required Skills ({missingSkills.length})
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {missingSkills.map((skill) => (
                <SkillTag key={skill} name={skill} status="missing" />
              ))}
            </div>
          </div>

          {/* Targeted Study & Project Roadmaps */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={16} color="#818cf8" />
              Recommended Learning Plan & Project Ideas
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                      {idx + 1}. {item.skill}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      {item.impact}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <BookOpen size={15} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span><strong>Core Topics:</strong> {item.coreTopics}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <FolderGit2 size={15} color="#34d399" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span><strong>Hands-on Project:</strong> {item.recommendedProject}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              navigate('/student/profile');
            }}
            className="btn btn-primary"
          >
            Update Profile & Resume Skills <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
