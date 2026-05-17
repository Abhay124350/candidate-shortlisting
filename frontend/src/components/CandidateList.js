import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import "./CandidateList.css";

export default function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (skillFilter) params.skill = skillFilter;
      const res = await api.get("/candidates", { params });
      setCandidates(res.data.data);
    } catch {
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [search, skillFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(timer);
  }, [fetchCandidates]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/candidates/${id}`);
      toast.success(`${name} removed`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch {
      toast.error("Failed to delete candidate");
    }
  };

  return (
    <div className="card candidate-list-card">
      <div className="list-header">
        <h2 className="card-title">
          <span aria-hidden="true">👥</span> All Candidates
          <span className="count-badge">{candidates.length}</span>
        </h2>
        <div className="search-row">
          <input
            type="search"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            aria-label="Search candidates"
          />
          <input
            type="text"
            placeholder="Filter by skill..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="search-input"
            aria-label="Filter by skill"
          />
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner-dark" aria-label="Loading candidates" />
          <p>Loading candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <p>No candidates found. Add one to get started!</p>
        </div>
      ) : (
        <ul className="candidate-items" role="list">
          {candidates.map((c) => (
            <li key={c._id} className="candidate-item">
              <div className="candidate-info">
                <div className="candidate-name">{c.name}</div>
                <div className="candidate-email">{c.email}</div>
                <div className="candidate-exp">
                  <span aria-hidden="true">💼</span> {c.experience} yr{c.experience !== 1 ? "s" : ""}
                </div>
                {c.bio && <div className="candidate-bio">{c.bio}</div>}
                <div className="skills-row">
                  {c.skills.map((skill) => (
                    <span key={skill} className="skill-tag skill-tag-default">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(c._id, c.name)}
                aria-label={`Delete ${c.name}`}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
