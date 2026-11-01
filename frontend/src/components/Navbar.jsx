import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  User,
  FileText,
  Search,
  PlusCircle,
  Users,
  LogOut,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function Navbar() {
  const { user, role, isStudent, isRecruiter, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.9rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              SkillMatch<span style={{ color: '#818cf8', WebkitTextFillColor: '#818cf8' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '-3px' }}>
              85% Smart Career Gateway
            </div>
          </div>
        </Link>

        {/* Navigation Links based on role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                className={`btn btn-sm ${isActive('/student/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Layers size={16} /> Dashboard
              </Link>
              <Link
                to="/student/jobs"
                className={`btn btn-sm ${isActive('/student/jobs') ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Search size={16} /> Job Openings
              </Link>
              <Link
                to="/student/applications"
                className={`btn btn-sm ${isActive('/student/applications') ? 'btn-primary' : 'btn-secondary'}`}
              >
                <CheckCircle2 size={16} /> Applied Jobs
              </Link>
              <Link
                to="/student/profile"
                className={`btn btn-sm ${isActive('/student/profile') ? 'btn-primary' : 'btn-secondary'}`}
              >
                <User size={16} /> Profile & Resume
              </Link>
            </>
          )}

          {isRecruiter && (
            <>
              <Link
                to="/recruiter/dashboard"
                className={`btn btn-sm ${isActive('/recruiter/dashboard') ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Layers size={16} /> Recruiter Hub
              </Link>
              <Link
                to="/recruiter/jobs"
                className={`btn btn-sm ${isActive('/recruiter/jobs') ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Briefcase size={16} /> Manage Openings
              </Link>
              <Link
                to="/recruiter/applicants"
                className={`btn btn-sm ${isActive('/recruiter/applicants') ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Users size={16} /> Candidates
              </Link>
            </>
          )}

          {!user && (
            <>
              <Link to="/student/jobs" className="btn btn-sm btn-secondary">
                <Search size={16} /> Browse Openings
              </Link>
            </>
          )}
        </nav>

        {/* User Profile & Auth Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span
                    className={`badge ${isStudent ? 'badge-eligible' : 'badge-domain'}`}
                    style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}
                  >
                    {isStudent ? '🎓 Student' : '🏢 Recruiter'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-secondary"
                title="Sign Out"
                style={{ padding: '0.5rem 0.75rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn btn-sm btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
