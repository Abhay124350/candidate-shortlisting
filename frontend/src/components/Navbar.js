import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon" aria-hidden="true">🎯</span>
          <span className="brand-name">TalentMatch</span>
          <span className="brand-sub">AI-Powered Candidate Shortlisting</span>
        </div>
        <div className="navbar-badge">
          <span className="ai-badge">⚡ OpenRouter AI</span>
        </div>
      </div>
    </header>
  );
}
