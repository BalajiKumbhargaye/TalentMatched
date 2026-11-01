# SkillMatch AI — Automated Skill-Matching Job Portal (MERN Stack)

A production-grade Full-Stack MERN application with automated resume skill extraction, intelligent **85% requirement matching**, actionable student improvement roadmaps, and dedicated dashboards for **Students** and **Recruiters**.

---

## 🌟 Key Application Features

### 🎓 1. Student Portal
- **Automated Resume Parsing**: Upload your resume in **PDF** or **Text (.txt)** format. The backend parsing engine scans the document against a curated taxonomy of 250+ tech frameworks, tools, and libraries, extracting matching skills directly into your profile.
- **Skill Profile Management**: View verified skills as interactive chips, manually add custom skills, or remove obsolete tags.
- **Job Discovery & Search**: Filter openings by **keyword**, **domain** (Frontend, Backend, Fullstack, AI/ML, DevOps, Data Science, etc.), **role**, and **job type**.
- **85% Requirement Match Engine**:
  - **Match &ge; 85%**: Unlocks the green **"Apply Now"** button with 1-click submission.
  - **Match &lt; 85%**: Locks the apply action and provides an **"Areas to Improve"** breakdown:
    - Lists exact missing required skills
    - Calculates points needed to reach 85%
    - Provides core topics to study for each missing skill
    - Suggests hands-on portfolio projects to gain competence
- **Application Tracker**: Monitor real-time review status (*Applied*, *Under Review*, *Shortlisted*, *Accepted*, *Rejected*) across all submitted roles.

---

### 🏢 2. Recruiter Portal
- **Separate Dedicated Dashboard**: Independent analytics tracking active openings, qualified applicants received, shortlisted candidates, and filled positions.
- **Job Opening Creation**:
  - Specify title, company, domain, role, description, and compensation.
  - Define evaluated mandatory skills (used for the 85% student matching condition).
  - Set application deadline date and total opening positions count.
- **Job Opening Management & Updates**:
  - Update required skills, description, or vacancy counts.
  - Mark openings as *Active*, *Closed*, or *Filled*.
  - **Conditional Deletion**: Delete openings if the application deadline has passed or if all candidate selections are fulfilled.
- **Candidate Application Review**:
  - View qualified applicant profiles with exact match percentage (&ge; 85%).
  - Direct access to download/view candidate's uploaded resume file.
  - Inspect candidate's matched skills and academic credentials.
  - Update candidate status (*Under Review*, *Shortlisted*, *Accepted*, *Rejected*) and save recruiter feedback notes.

---

## 🛠️ Technology Stack

- **Database**: MongoDB (Mongoose ODM)
- **Backend API**: Node.js & Express.js
- **Frontend App**: React (Vite, React Router v7, Lucide Icons)
- **Styling**: Ultra-modern Vanilla CSS with Glassmorphism, Google Fonts (`Plus Jakarta Sans` & `Outfit`), and Dark-mode design system
- **Resume Processing**: `pdf-parse` with custom skill taxonomy matching and alias normalization

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (verified on Node v24)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
node utils/seedData.js   # Seeds realistic jobs, student & recruiter accounts
node server.js           # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Starts client on http://localhost:3000
```

---

## ⚡ Demo Test Credentials

| Role | Email | Password | Pre-configured Stacks / Access |
| :--- | :--- | :--- | :--- |
| **🎓 Student (Alex Rivera)** | `student@example.com` | `password123` | Fullstack MERN skills (React, Node, Express, MongoDB, JS, Git) |
| **🏢 Recruiter (Sarah Jenkins)** | `recruiter@techcorp.com` | `password123` | TechCorp Solutions hiring portal & job manager |
