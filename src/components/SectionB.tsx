"use client";

import React from "react";
import { SubmissionType } from "../data/formData";

interface SectionBProps {
  submissionType: SubmissionType | "";
  onChange: (type: SubmissionType) => void;
  errors: Record<string, string>;
}

export default function SectionB({ submissionType, onChange, errors }: SectionBProps) {
  return (
    <div id="section-b-container">
      <h3 className="section-subtitle" style={{ fontSize: "1.35rem", marginBottom: "1.5rem" }}>
        Section B: Submission Details
      </h3>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
        Please choose which type of information you would like to submit. Your choice will dynamically open the appropriate fields below.
      </p>

      {errors.submissionType && (
        <div
          className="form-error-msg"
          style={{
            display: "block",
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "var(--color-error-bg)",
            borderLeft: "4px solid var(--color-error)",
            borderRadius: "var(--border-radius-sm)",
          }}
        >
          {errors.submissionType}
        </div>
      )}

      <div className="submission-type-grid" id="submission-type-selector" style={{ gap: "1.25rem", margin: "1rem 0 2rem 0" }}>
        {/* Activity or Event Card */}
        <div
          className={`choice-card ${submissionType === "activity_event" ? "selected" : ""}`}
          onClick={() => onChange("activity_event")}
          id="choice-activity-event"
          style={{ padding: "1.5rem 1rem", gap: "0.75rem" }}
        >
          <div className="choice-icon" style={{ width: "4rem", height: "4rem" }}>
            <span style={{ fontSize: "2rem" }}>🎯</span>
          </div>
          <h4 className="choice-title" style={{ fontSize: "1.1rem" }}>Activity / Event</h4>
          <p className="choice-desc" style={{ fontSize: "0.8rem", margin: 0 }}>
            Select this to report an activity or event that has already occurred, or to plan and request resources for an upcoming community event.
          </p>
        </div>

        {/* Meeting Minutes or Planning Card */}
        <div
          className={`choice-card ${submissionType === "meeting" ? "selected" : ""}`}
          onClick={() => onChange("meeting")}
          id="choice-meeting"
          style={{ padding: "1.5rem 1rem", gap: "0.75rem" }}
        >
          <div className="choice-icon" style={{ width: "4rem", height: "4rem" }}>
            <span style={{ fontSize: "2rem" }}>🤝</span>
          </div>
          <h4 className="choice-title" style={{ fontSize: "1.1rem" }}>Meeting Minutes / Planning</h4>
          <p className="choice-desc" style={{ fontSize: "0.8rem", margin: 0 }}>
            Select this to schedule/plan a new meeting (with agenda and venue) or submit the minutes and attendance of a meeting that was held.
          </p>
        </div>
      </div>
    </div>
  );
}
