"use client";

import React from "react";
import { SubmissionType } from "../data/questionnaireData";

interface SectionBProps {
  submissionType: SubmissionType | "";
  onChange: (type: SubmissionType) => void;
  errors: Record<string, string>;
}

export default function SectionB({ submissionType, onChange, errors }: SectionBProps) {
  return (
    <div id="section-b-container">
      <h3 className="section-subtitle" style={{ fontSize: "1.35rem", marginBottom: "1.5rem" }}>
        Section B: Select Submission Type
      </h3>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
        Please choose which type of information you would like to submit. Your choice will dynamically open the appropriate fields.
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

      <div className="submission-type-grid" id="submission-type-selector">
        {/* Activity or Event Card */}
        <div
          className={`choice-card ${submissionType === "activity_event" ? "selected" : ""}`}
          onClick={() => onChange("activity_event")}
          id="choice-activity-event"
        >
          <div className="choice-icon">
            <span style={{ fontSize: "2.5rem" }}>🎯</span>
          </div>
          <h4 className="choice-title">Activity / Event</h4>
          <p className="choice-desc">
            Select this to report an activity or event that has already occurred, or to plan and request resources for an upcoming community event.
          </p>
        </div>

        {/* Meeting Minutes or Planning Card */}
        <div
          className={`choice-card ${submissionType === "meeting" ? "selected" : ""}`}
          onClick={() => onChange("meeting")}
          id="choice-meeting"
        >
          <div className="choice-icon">
            <span style={{ fontSize: "2.5rem" }}>🤝</span>
          </div>
          <h4 className="choice-title">Meeting Minutes / Planning</h4>
          <p className="choice-desc">
            Select this to schedule/plan a new meeting (with agenda and venue) or submit the minutes and attendance of a meeting that was held.
          </p>
        </div>
      </div>
    </div>
  );
}
