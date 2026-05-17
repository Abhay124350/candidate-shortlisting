import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import "./InterviewModal.css";

export default function InterviewModal({ candidate, onClose }) {
  const [jobRole, setJobRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/interview-questions", {
        candidateId: candidate._id,
        jobRole: jobRole || "Software Developer",
        requiredSkills: candidate.skills,
      });
      setQuestions(res.data.data);
      setGenerated(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const typeColor = {
    Technical: "#dbeafe",
    Behavioral: "#d1fae5",
    Situational: "#fef3c7",
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="modal-title">🎤 Interview Questions — {candidate.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {!generated ? (
          <div className="modal-body">
            <p className="modal-hint">
              Generate AI-powered interview questions tailored to <strong>{candidate.name}</strong>'s
              profile.
            </p>
            <div className="form-group">
              <label htmlFor="jobRole">Job Role</label>
              <input
                id="jobRole"
                type="text"
                placeholder="e.g. Full Stack Developer"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>
            <div className="skills-row" style={{ marginBottom: "1rem" }}>
              {candidate.skills?.map((s) => (
                <span key={s} className="skill-tag skill-tag-default">{s}</span>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <span className="spinner" aria-label="Generating" /> : "Generate Questions"}
            </button>
          </div>
        ) : (
          <div className="modal-body">
            <ol className="question-list">
              {questions.map((q, i) => (
                <li key={i} className="question-item">
                  <div className="question-meta">
                    <span
                      className="question-type"
                      style={{ background: typeColor[q.type] || "#f1f5f9" }}
                    >
                      {q.type}
                    </span>
                    {q.skill && (
                      <span className="skill-tag skill-tag-default">{q.skill}</span>
                    )}
                  </div>
                  <p className="question-text">{q.question}</p>
                </li>
              ))}
            </ol>
            <button
              className="btn btn-secondary"
              onClick={() => setGenerated(false)}
              style={{ marginTop: "1rem" }}
            >
              ← Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
