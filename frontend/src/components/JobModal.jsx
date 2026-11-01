import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import SkillTag from './SkillTag';

const DOMAINS = [
  'Fullstack',
  'Frontend',
  'Backend',
  'Mobile Development',
  'DevOps & Cloud',
  'AI & Machine Learning',
  'Data Science',
  'Cybersecurity',
  'UI/UX Design',
  'QA & Testing',
  'Other',
];

const COMMON_SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript',
  'Python', 'Docker', 'AWS', 'Kubernetes', 'Next.js', 'Tailwind CSS',
  'PostgreSQL', 'Redis', 'GraphQL', 'REST APIs', 'Git', 'CI/CD'
];

export default function JobModal({ isOpen, onClose, onSubmit, initialJob = null, saving = false }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    domain: 'Fullstack',
    role: '',
    jobType: 'Full-Time',
    location: 'Remote',
    salary: '$80,000 - $110,000 / yr',
    description: '',
    requiredSkills: [],
    deadline: '',
    maxPositions: 1,
    status: 'Active',
  });

  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialJob) {
      setFormData({
        title: initialJob.title || '',
        company: initialJob.company || '',
        domain: initialJob.domain || 'Fullstack',
        role: initialJob.role || '',
        jobType: initialJob.jobType || 'Full-Time',
        location: initialJob.location || 'Remote',
        salary: initialJob.salary || '',
        description: initialJob.description || '',
        requiredSkills: initialJob.requiredSkills || [],
        deadline: initialJob.deadline ? new Date(initialJob.deadline).toISOString().split('T')[0] : '',
        maxPositions: initialJob.maxPositions || 1,
        status: initialJob.status || 'Active',
      });
    } else {
      // Default future deadline (30 days from now)
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setFormData({
        title: '',
        company: '',
        domain: 'Fullstack',
        role: '',
        jobType: 'Full-Time',
        location: 'Remote',
        salary: '$85,000 - $115,000 / yr',
        description: '',
        requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB'],
        deadline: d.toISOString().split('T')[0],
        maxPositions: 2,
        status: 'Active',
      });
    }
    setError('');
  }, [initialJob, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;
    if (!formData.requiredSkills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmed],
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.role || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.requiredSkills.length === 0) {
      setError('Please add at least one required skill.');
      return;
    }
    if (!formData.deadline) {
      setError('Please select an application deadline.');
      return;
    }
    setError('');
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.3rem' }}>
              {initialJob ? 'Update Job Opening' : 'Post New Job Opening'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Configure job requirements, deadline, and target skills for student matching.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-secondary" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.88rem',
              }}>
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Fullstack MERN Developer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  name="company"
                  placeholder="e.g. TechCorp Solutions"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Domain / Category *</label>
                <select name="domain" value={formData.domain} onChange={handleChange} required>
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role Specification *</label>
                <input
                  type="text"
                  name="role"
                  placeholder="e.g. Lead React/Node Engineer"
                  value={formData.role}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select name="jobType" value={formData.jobType} onChange={handleChange}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Remote or Austin, TX"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Compensation / Salary</label>
                <input
                  type="text"
                  name="salary"
                  placeholder="e.g. $90,000 - $120,000 / yr"
                  value={formData.salary}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Describe key responsibilities, daily work, team structure, and prerequisites..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            {/* Required Skills Picker */}
            <div className="form-group">
              <label className="form-label">
                Required Skills * (Evaluated for the 85% match condition)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Type skill & press Enter (e.g. React, Docker, Node.js)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              {/* Selected skills cloud */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '36px', marginBottom: '0.5rem' }}>
                {formData.requiredSkills.map((s) => (
                  <SkillTag key={s} name={s} onRemove={handleRemoveSkill} />
                ))}
              </div>

              {/* Quick suggestions */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Quick suggestions:{' '}
                {COMMON_SKILL_SUGGESTIONS.filter((s) => !formData.requiredSkills.includes(s)).slice(0, 6).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    style={{
                      background: 'none',
                      color: '#a5b4fc',
                      textDecoration: 'underline',
                      marginRight: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    +{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Application Deadline *</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Positions / Openings *</label>
                <input
                  type="number"
                  name="maxPositions"
                  min="1"
                  max="100"
                  value={formData.maxPositions}
                  onChange={handleChange}
                  required
                />
              </div>

              {initialJob && (
                <div className="form-group">
                  <label className="form-label">Opening Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Filled">Filled</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : initialJob ? 'Update Job' : 'Publish Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
