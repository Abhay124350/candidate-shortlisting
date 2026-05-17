import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import InterviewModal from "./InterviewModal";
import "./ShortlistResults.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ScoreBar({ score }) {
  const cls = score >= 70 ? "score-high" : score >= 40 ? "score-partial" : "score-low";
  return (
    <div className="score-bar-wrap" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
      <div className={`score-bar-fill ${cls}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function ShortlistResults({ results, isAiMode }) {
  const [showChart, setShowChart] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState(null);
  const [saved, setSaved] = useState(new Set());

  if (!results || results.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="icon">🔍</div>
          <p>No candidates matched the criteria.</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: results.map((r) => r.name),
    datasets: [
      {
        label: "Match Score (%)",
        data: results.map((r) => isAiMode ? r.aiMatchScore : r.matchScore),
        backgroundColor: results.map((r) => {
          const score = isAiMode ? r.aiMatchScore : r.matchScore;
          return score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
        }),
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Candidate Match Scores" },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } },
    },
  };

  const toggleSave = (id) => {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="results-section">
      <div className="results-header">
        <h2 className="card-title">
          {isAiMode ? "🤖 AI Shortlist Results" : "🎯 Shortlist Results"}
          <span className="count-badge">{results.length}</span>
        </h2>
        <button
          className="btn btn-secondary"
          onClick={() => setShowChart((v) => !v)}
          aria-expanded={showChart}
        >
          {showChart ? "Hide Chart" : "📊 Show Chart"}
        </button>
      </div>

      {showChart && (
        <div className="card chart-card">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="results-grid">
        {results.map((candidate, idx) => {
          const score = isAiMode ? candidate.aiMatchScore : candidate.matchScore;
          const isSaved = saved.has(candidate._id);

          return (
            <div key={candidate._id || idx} className="result-card card">
              <div className="result-top">
                <div className="result-rank">#{isAiMode ? candidate.rank : idx + 1}</div>
                <div className="result-name-block">
                  <div className="result-name">{candidate.name}</div>
                  <div className="result-email">{candidate.email}</div>
                </div>
                <div className="result-actions">
                  <button
                    className={`btn-save ${isSaved ? "saved" : ""}`}
                    onClick={() => toggleSave(candidate._id)}
                    aria-label={isSaved ? "Unsave candidate" : "Save candidate"}
                    title={isSaved ? "Saved" : "Save"}
                  >
                    {isSaved ? "⭐" : "☆"}
                  </button>
                </div>
              </div>

              <div className="result-score-row">
                <span className="score-label">
                  {score}% match
                </span>
                {!isAiMode && candidate.tier && (
                  <span className={`tier-badge tier-${candidate.tier}`}>{candidate.tier}</span>
                )}
              </div>
              <ScoreBar score={score} />

              <div className="result-meta">
                <span>💼 {candidate.experience} yr{candidate.experience !== 1 ? "s" : ""}</span>
              </div>

              {/* Skills */}
              <div className="skills-row">
                {candidate.skills?.map((skill) => {
                  const isMatched = candidate.matchedRequired?.includes(skill.toLowerCase());
                  return (
                    <span
                      key={skill}
                      className={`skill-tag ${isMatched ? "skill-tag-matched" : "skill-tag-default"}`}
                    >
                      {isMatched && "✓ "}{skill}
                    </span>
                  );
                })}
              </div>

              {/* AI-specific fields */}
              {isAiMode && candidate.explanation && (
                <div className="ai-explanation">
                  <p className="ai-label">🤖 AI Analysis</p>
                  <p>{candidate.explanation}</p>
                  {candidate.strengths?.length > 0 && (
                    <div className="ai-strengths">
                      <strong>Strengths:</strong>{" "}
                      {candidate.strengths.map((s) => (
                        <span key={s} className="skill-tag skill-tag-matched">{s}</span>
                      ))}
                    </div>
                  )}
                  {candidate.gaps?.length > 0 && (
                    <div className="ai-gaps">
                      <strong>Gaps:</strong>{" "}
                      {candidate.gaps.map((g) => (
                        <span key={g} className="skill-tag skill-tag-unmatched">{g}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn btn-interview"
                onClick={() => setInterviewCandidate(candidate)}
              >
                🎤 Generate Interview Questions
              </button>
            </div>
          );
        })}
      </div>

      {interviewCandidate && (
        <InterviewModal
          candidate={interviewCandidate}
          onClose={() => setInterviewCandidate(null)}
        />
      )}
    </div>
  );
}
