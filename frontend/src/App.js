import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import CandidateForm from "./components/CandidateForm";
import CandidateList from "./components/CandidateList";
import JobMatchForm from "./components/JobMatchForm";
import ShortlistResults from "./components/ShortlistResults";
import "./App.css";

const TABS = [
  { id: "candidates", label: "Candidates", icon: "👥" },
  { id: "match", label: "Shortlist", icon: "🎯" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("candidates");
  const [refreshKey, setRefreshKey] = useState(0);
  const [shortlistData, setShortlistData] = useState(null);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleCandidateAdded = () => setRefreshKey((k) => k + 1);

  const handleShortlistResult = (data, aiMode) => {
    setShortlistData(data);
    setIsAiMode(aiMode);
  };

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar />

      <main className="main-content container">
        {/* Tab Navigation */}
        <div className="tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span aria-hidden="true">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Candidates Tab */}
        {activeTab === "candidates" && (
          <div className="tab-content">
            <div className="two-col">
              <CandidateForm onAdded={handleCandidateAdded} />
              <CandidateList key={refreshKey} />
            </div>
          </div>
        )}

        {/* Shortlist Tab */}
        {activeTab === "match" && (
          <div className="tab-content">
            <JobMatchForm onResult={handleShortlistResult} />
            {shortlistData && (
              <ShortlistResults results={shortlistData} isAiMode={isAiMode} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
