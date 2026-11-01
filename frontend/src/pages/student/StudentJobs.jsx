import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchJobs, applyForJob } from '../../services/api';
import {
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import JobCard from '../../components/JobCard';
import ImprovementModal from '../../components/ImprovementModal';

const DOMAINS = [
  'All Domains',
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
];

export default function StudentJobs() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [domain, setDomain] = useState(searchParams.get('domain') || 'All Domains');
  const [jobType, setJobType] = useState('All');
  const [onlyEligible, setOnlyEligible] = useState(searchParams.get('onlyEligible') === 'true');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForImprovement, setSelectedJobForImprovement] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetchJobs({
        search,
        domain,
        jobType,
        onlyEligible,
        status: 'Active',
      });
      if (res.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [domain, jobType, onlyEligible]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadJobs();
  };

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setAlert(null);
    try {
      const res = await applyForJob(jobId);
      if (res.success) {
        setAlert({
          type: 'success',
          text: res.message || 'Application submitted successfully!',
        });
        await loadJobs();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        text: err.data?.message || err.message || 'Failed to submit application.',
      });
    } finally {
      setApplyingId(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDomain('All Domains');
    setJobType('All');
    setOnlyEligible(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Explore Job Openings & Match Telemetry</h1>
        <p className="page-subtitle">
          Search opportunities by domain, role, and verified 85%+ qualification threshold.
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
          {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1.8fr) minmax(180px, 1fr) minmax(140px, 0.8fr) auto',
            gap: '1rem',
            alignItems: 'center',
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search by role, title, skill, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem' }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '13px' }}
              />
            </div>

            {/* Domain Filter */}
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              style={{ width: '100%' }}
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Job Type Filter */}
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="All">All Job Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>

            {/* Search Button */}
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
              <Search size={16} /> Search
            </button>
          </div>

          {/* Sub-Filters / Eligibility Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f8fafc' }}>
              <input
                type="checkbox"
                checked={onlyEligible}
                onChange={(e) => setOnlyEligible(e.target.checked)}
                style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 600 }}>Show Only Qualified Roles (&ge; 85% Skill Match)</span>
            </label>

            {(search || domain !== 'All Domains' || jobType !== 'All' || onlyEligible) && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-sm btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                <X size={14} /> Clear All Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results Count Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{jobs.length}</strong> available openings
          {domain !== 'All Domains' && ` in ${domain}`}
          {onlyEligible && ' meeting 85%+ requirement'}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          Loading and evaluating job match scores...
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <Layers size={44} color="#818cf8" style={{ marginBottom: '1rem', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Matching Job Openings Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            We could not find openings matching your filter criteria. Try expanding your search domain or adjusting the &ge;85% match toggle.
          </p>
          <button onClick={resetFilters} className="btn btn-secondary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
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
