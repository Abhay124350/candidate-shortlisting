import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import "./JobMatchForm.css";

const INITIAL = { requiredSkills: "", preferredSkills: "", minExperience: "" };

export default function JobMatchForm({ onResult }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const parseSkills = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const buildPayload = () => ({
    requiredSkills: parseSkills(form.requiredSkills),
    preferredSkills: parseSkills(form.preferredSkills),
    minExperience: parseFloat(form.minExperience) || 0,
  });

  const handleBasicMatch = async (e) => {
    e.preventDefault();
    const payload = buildPayload();
    if (payload.requiredSkills.length === 0) {
      toast.error("Enter at least one required skill");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/match", payload);
      onResult(res.data.data, false);
      toast.success(`Found ${res.data.count} matching candidate(s)`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Matching failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAiMatch = async () => {
    const payload = buildPayload();
    if (payload.requiredSkills.length === 0) {
      toast.error("Enter at least one required skill");
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.post("/ai/shortlist", payload);
      onResult(res.data.data, true);
      toast.success(`AI ranked ${res.data.count} candidate(s)`);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI shortlisting failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="card job-form-card">
      <h2 className="card-title">
        <span aria-hidden="true">🔍</span> Job Requirements
      </h2>
      <form onSubmit={handleBasicMatch} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="requiredSkills">Required Skills * (comma-separated)</label>
            <input
              id="requiredSkills"
              name="requiredSkills"
              type="text"
              placeholder="e.g. React, Node.js"
              value={form.requiredSkills}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="preferredSkills">Preferred Skills (optional)</label>
            <input
              id="preferredSkills"
              name="preferredSkills"
              type="text"
              placeholder="e.g. AWS, TypeScript"
              value={form.preferredSkills}
              onChange={handleChange}
            />
          </div>

          <div className="form-group form-group-sm">
            <label htmlFor="minExperience">Min. Experience (years)</label>
            <input
              id="minExperience"
              name="minExperience"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 1"
              value={form.minExperience}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="action-row">
          <button type="submit" className="btn btn-primary" disabled={loading || aiLoading}>
            {loading ? <span className="spinner" aria-label="Loading" /> : "🎯 Basic Shortlist"}
          </button>
          <button
            type="button"
            className="btn btn-ai"
            onClick={handleAiMatch}
            disabled={loading || aiLoading}
          >
            {aiLoading ? <span className="spinner" aria-label="Loading" /> : "🤖 AI Shortlist"}
          </button>
        </div>
      </form>
    </div>
  );
}
