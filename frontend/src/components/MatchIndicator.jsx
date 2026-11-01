import React from 'react';
import { CheckCircle, AlertTriangle, Lock } from 'lucide-react';

export default function MatchIndicator({ percentage = 0, isEligible = false, showBadge = true, size = 56 }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  const colorClass = isEligible ? 'eligible' : percentage >= 50 ? 'locked' : 'danger';
  const strokeColor = isEligible ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="match-indicator-wrapper" style={{ alignItems: 'center' }}>
      <div
        className="match-circle-wrap"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg
          className="match-circle-svg"
          viewBox="0 0 56 56"
          width={size}
          height={size}
        >
          <circle
            className="match-circle-bg"
            cx="28"
            cy="28"
            r={radius}
          />
          <circle
            className={`match-circle-progress ${colorClass}`}
            cx="28"
            cy="28"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke={strokeColor}
          />
        </svg>
        <div
          className="match-circle-text"
          style={{ color: strokeColor }}
        >
          {percentage}%
        </div>
      </div>

      {showBadge && (
        <div>
          {isEligible ? (
            <span className="badge badge-eligible">
              <CheckCircle size={13} /> 85%+ Eligible to Apply
            </span>
          ) : (
            <span className="badge badge-locked">
              <Lock size={13} /> {percentage < 85 ? 'Unlock at 85% Match' : 'Review Skills'}
            </span>
          )}
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {isEligible ? 'Skills qualify for role' : 'Skill gap needs improvement'}
          </div>
        </div>
      )}
    </div>
  );
}
