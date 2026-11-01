import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadStudentResume } from '../services/api';
import {
  UploadCloud,
  FileCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import SkillTag from './SkillTag';

export default function ResumeUploader({ onSkillsExtracted }) {
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'text/plain'];
    const validExtensions = ['.pdf', '.txt'];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(selectedFile.type) && !hasValidExt) {
      setMessage({ type: 'error', text: 'Please upload a PDF (.pdf) or Text (.txt) resume file.' });
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await uploadStudentResume(formData);
      if (res.success) {
        setExtractedSkills(res.extractedSkills || []);
        setMessage({
          type: 'success',
          text: `Success! ${res.extractedSkills.length} skills automatically extracted and added to your profile.`,
        });
        await refreshUser();
        if (onSkillsExtracted) {
          onSkillsExtracted(res.extractedSkills, res.allSkills);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Failed to parse resume. Please ensure the file is readable.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#818cf8',
        }}>
          <Sparkles size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>Automated Resume Skill Extractor</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Upload your resume. Our parsing engine automatically scans and syncs verified skills to your profile.
          </p>
        </div>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? '#6366f1' : 'rgba(255, 255, 255, 0.15)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(15, 23, 42, 0.4)',
          transition: 'var(--transition-fast)',
          marginTop: '1rem',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          disabled={uploading}
        />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <Loader2 size={36} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Extracting & Indexing Skills...</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Analyzing text against 250+ tech frameworks and skills taxonomy
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a5b4fc',
            }}>
              <UploadCloud size={28} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f8fafc' }}>
                Click to browse or drop your resume here
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Supports standard PDF and Text (.pdf, .txt) files up to 10MB
              </div>
            </div>

            {user?.resumeOriginalName && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '0.35rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}>
                <FileText size={14} color="#67e8f9" /> Current Resume: <strong>{user.resumeOriginalName}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Banner */}
      {message && (
        <div style={{
          marginTop: '1rem',
          padding: '0.85rem 1.2rem',
          borderRadius: 'var(--radius-md)',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#fb7185',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem',
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Extracted Skills Preview */}
      {extractedSkills.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            🎉 Newly Extracted Skills from Resume ({extractedSkills.length}):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {extractedSkills.map((skill) => (
              <SkillTag key={skill} name={skill} status="matched" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
