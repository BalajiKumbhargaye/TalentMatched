import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, User, Building2, Mail, Lock, Phone } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    companyName: '',
    companyWebsite: '',
    designation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        role,
      };

      const res = await register(payload);
      if (res.success) {
        if (role === 'recruiter') {
          navigate('/recruiter/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '520px',
      margin: '2rem auto',
      width: '100%',
    }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--grad-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            marginBottom: '0.8rem',
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Choose your role to get a tailored workspace
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.75rem',
        }}>
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`btn btn-sm ${role === 'student' ? 'btn-primary' : ''}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <User size={15} /> Student Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('recruiter')}
            className={`btn btn-sm ${role === 'recruiter' ? 'btn-primary' : ''}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <Building2 size={15} /> Recruiter / Employer
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.88rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder={role === 'student' ? 'e.g. Alex Rivera' : 'e.g. Sarah Jenkins'}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. yourname@domain.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password * (min. 6 characters)</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <>
              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Bio / Career Goal (Optional)</label>
                <textarea
                  name="bio"
                  rows={2}
                  placeholder="e.g. Aspiring Fullstack MERN developer seeking impactful roles..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {/* Recruiter Specific Fields */}
          {role === 'recruiter' && (
            <>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. TechCorp Solutions"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Your Designation</label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="e.g. Tech Recruiter / HR Lead"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Website</label>
                  <input
                    type="url"
                    name="companyWebsite"
                    placeholder="https://company.com"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'student' ? 'Student' : 'Recruiter'}`} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
