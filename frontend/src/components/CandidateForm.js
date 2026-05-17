import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const INITIAL = { name: "", email: "", skills: "", experience: "", bio: "" };

export default function CandidateForm({ onAdded }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillsArray.length === 0) {
      toast.error("Please enter at least one skill");
      return;
    }

    const exp = parseFloat(form.experience);
    if (isNaN(exp) || exp < 0) {
      toast.error("Experience must be a non-negative number");
      return;
    }

    setLoading(true);
    try {
      await api.post("/candidates", {
        name: form.name.trim(),
        email: form.email.trim(),
        skills: skillsArray,
        experience: exp,
        bio: form.bio.trim(),
      });
      toast.success(`${form.name} added successfully!`);
      setForm(INITIAL);
      onAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <span aria-hidden="true">➕</span> Add Candidate
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. rahul@gmail.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="skills">Skills * (comma-separated)</label>
          <input
            id="skills"
            name="skills"
            type="text"
            placeholder="e.g. React, Node.js, MongoDB"
            value={form.skills}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="experience">Experience (years) *</label>
          <input
            id="experience"
            name="experience"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 2"
            value={form.experience}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio / Projects</label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Brief description of projects or background..."
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" aria-label="Loading" /> : "Add Candidate"}
        </button>
      </form>
    </div>
  );
}
