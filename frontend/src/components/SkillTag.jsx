import React from 'react';
import { Check, X } from 'lucide-react';

export default function SkillTag({ name, status = 'neutral', onRemove, size = 'md' }) {
  const getStatusClass = () => {
    if (status === 'matched') return 'skill-tag matched';
    if (status === 'missing') return 'skill-tag missing';
    return 'skill-tag';
  };

  return (
    <span className={getStatusClass()} style={{ fontSize: size === 'sm' ? '0.75rem' : '0.82rem' }}>
      {status === 'matched' && <Check size={12} color="#10b981" />}
      {status === 'missing' && <span style={{ color: '#f43f5e', fontWeight: 700 }}>•</span>}
      <span>{name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          title={`Remove ${name}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '4px',
            color: 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={13} />
        </button>
      )}
    </span>
  );
}
