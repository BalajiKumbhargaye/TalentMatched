import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentProfile,
  updateStudentProfile,
  addStudentSkill,
  removeStudentSkill,
} from '../../services/api';
import {
  User,
  GraduationCap,
  Sparkles,
  Save,
  Plus,
  FileText,
  Download,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import ResumeUploader from '../../components/ResumeUploader';
import SkillTag from '../../components/SkillTag';

const QUICK_SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'TypeScript',
  'Python', 'Docker', 'AWS', 'Kubernetes', 'Next.js', 'Tailwind CSS',
  'PostgreSQL', 'Redis', 'GraphQL', 'REST APIs', 'Git', 'HTML5', 'CSS3'
];

export default function StudentProfile() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    degree: '',
    college: '',
    graduationYear: 2026,
    experienceLevel: 'Fresher',
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        degree: user.education?.degree || '',
        college: user.education?.college || '',
        graduationYear: user.education?.graduationYear || 2026,
        experienceLevel: user.experienceLevel || 'Fresher',
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        experienceLevel: formData.experienceLevel,
        education: {
          degree: formData.degree,
          college: formData.college,
          graduationYear: Number(formData.graduationYear),
        },
      };

      const res = await updateStudentProfile(payload);
      if (res.success) {
        setAlert({ type: 'success', text: 'Profile updated successfully!' });
        await refreshUser();
      }
    } catch (err) {
      setAlert({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (skillToAdd) => {
    const skillName = (skillToAdd || newSkill).trim();
    if (!skillName) return;

    try {
      const res = await addStudentSkill(skillName);
      if (res.success) {
        setSkills(res.skills);
        setNewSkill('');
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleRemoveSkill = async (skillName) => {
    try {
      const res = await removeStudentSkill(skillName);
      if (res.success) {
        setSkills(res.skills);
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Candidate Profile & Skill Management</h1>
        <p className="page-subtitle">
          Manage your verified credentials, automated resume extraction, and skill matrix.
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
          <CheckCircle size={18} />
          <span>{alert.text}</span>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(320px, 1fr)',
        gap: '2rem',
      }}>
        {/* Left Column: Profile Details Form */}
        <div>
          <form onSubmit={handleProfileSubmit} className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="#818cf8" /> Personal & Academic Details
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Account ID)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                  <option value="Fresher">Fresher (New Graduate)</option>
                  <option value="Intern">Intern</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Summary / Bio</label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Introduce your technical strengths, core stacks, and career ambitions..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* Academic Information */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <GraduationCap size={18} color="#34d399" /> Education
              </h4>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Degree / Major</label>
                  <input
                    type="text"
                    name="degree"
                    placeholder="e.g. B.Tech Computer Science"
                    value={formData.degree}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">College / University</label>
                  <input
                    type="text"
                    name="college"
                    placeholder="e.g. Apex Institute of Technology"
                    value={formData.college}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    type="number"
                    name="graduationYear"
                    min="2000"
                    max="2035"
                    value={formData.graduationYear}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ marginTop: '1.25rem' }}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Column: Resume & Skill Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Resume Upload Module */}
          <ResumeUploader onSkillsExtracted={() => refreshUser()} />

          {/* Skill Matrix Management */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#818cf8" /> Verified Skill Matrix ({skills.length})
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              These skills are evaluated directly against job requirements to calculate your 85% match qualification.
            </p>

            {/* Add Custom Skill Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Add skill (e.g. Docker, TypeScript)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
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

            {/* Skills Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              minHeight: '60px',
              padding: '0.75rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
            }}>
              {skills.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No skills added yet. Upload your resume or type above.
                </div>
              ) : (
                skills.map((s) => (
                  <SkillTag key={s} name={s} status="matched" onRemove={handleRemoveSkill} />
                ))
              )}
            </div>

            {/* Quick Suggestions */}
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Popular skills you can add with one click:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {QUICK_SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem',
                      color: '#a5b4fc',
                      cursor: 'pointer',
                    }}
                  >
                    +{s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
