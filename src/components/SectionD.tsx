"use client";

import React from "react";
import { QuestionnaireData, MeetingSubtype } from "../data/questionnaireData";

interface SectionDProps {
  formData: QuestionnaireData;
  onChange: (updates: Partial<QuestionnaireData>) => void;
  errors: Record<string, string>;
}

export default function SectionD({ formData, onChange, errors }: SectionDProps) {
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      meetingDetails: {
        ...formData.meetingDetails,
        [name]: value,
      },
    });
  };

  const handleSubtypeChange = (subtype: MeetingSubtype) => {
    onChange({
      meetingDetails: {
        ...formData.meetingDetails,
        meetingSubtype: subtype,
      },
    });
  };

  return (
    <div id="section-d-container">
      <h3 className="section-subtitle" style={{ fontSize: "1.35rem", marginBottom: "1.5rem" }}>
        Section D: Meeting Planning or Minutes
      </h3>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Program, PPP, and Activity Type details are not required for meeting submissions. Please fill in the details below.
      </p>

      {/* Meeting Subtype Choice */}
      <div className="form-group" style={{ marginBottom: "2rem" }}>
        <label className="form-label">
          Select Meeting Action <span className="required-dot">*</span>
        </label>
        {errors["meetingDetails.meetingSubtype"] && (
          <span className="form-error-msg" style={{ display: "block", marginBottom: "0.5rem" }}>
            {errors["meetingDetails.meetingSubtype"]}
          </span>
        )}
        <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
          <button
            type="button"
            className={`btn ${
              formData.meetingDetails.meetingSubtype === "planning"
                ? "btn-primary"
                : "btn-secondary"
            }`}
            style={{ flex: 1, padding: "0.6rem" }}
            onClick={() => handleSubtypeChange("planning")}
            id="btn-meeting-subtype-planning"
          >
            📅 Planning a Meeting
          </button>
          <button
            type="button"
            className={`btn ${
              formData.meetingDetails.meetingSubtype === "minutes"
                ? "btn-primary"
                : "btn-secondary"
            }`}
            style={{ flex: 1, padding: "0.6rem" }}
            onClick={() => handleSubtypeChange("minutes")}
            id="btn-meeting-subtype-minutes"
          >
            📝 Submitting Meeting Minutes
          </button>
        </div>
      </div>

      {/* Common Field: Meeting Title */}
      {formData.meetingDetails.meetingSubtype && (
        <div className="form-grid" style={{ marginBottom: "2rem" }}>
          <div className={`form-group full-width ${errors["meetingDetails.meetingTitle"] ? "error" : ""}`}>
            <label className="form-label" htmlFor="meetingTitle">
              Meeting Title <span className="required-dot">*</span>
              <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                (e.g. Monthly CMC Planning Meeting)
              </span>
            </label>
            <input
              type="text"
              id="meetingTitle"
              name="meetingTitle"
              value={formData.meetingDetails.meetingTitle}
              onChange={handleTextChange}
              className="form-input"
            />
            {errors["meetingDetails.meetingTitle"] && (
              <span className="form-error-msg">{errors["meetingDetails.meetingTitle"]}</span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          IF PLANNING A MEETING
          ======================================================== */}
      {formData.meetingDetails.meetingSubtype === "planning" && (
        <div className="section-card-wrapper" id="meeting-planning-details" style={{ animation: "modalFadeIn 0.35s ease" }}>
          <h4 style={{ color: "var(--pa-blue)", marginBottom: "1.2rem", fontSize: "1.1rem", borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            Meeting Schedule & Agenda
          </h4>

          <div className="form-grid">
            {/* Date & Time */}
            <div className={`form-group ${errors["meetingDetails.dateAndTime"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="dateAndTime">
                Date & Time of Meeting <span className="required-dot">*</span>
              </label>
              <input
                type="datetime-local"
                id="dateAndTime"
                name="dateAndTime"
                value={formData.meetingDetails.dateAndTime}
                onChange={handleTextChange}
                className="form-input"
              />
              {errors["meetingDetails.dateAndTime"] && (
                <span className="form-error-msg">{errors["meetingDetails.dateAndTime"]}</span>
              )}
            </div>

            {/* Venue */}
            <div className={`form-group ${errors["meetingDetails.venue"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="venue">
                Venue <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (e.g. Community Church Hall)
                </span>
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.meetingDetails.venue}
                onChange={handleTextChange}
                className="form-input"
              />
              {errors["meetingDetails.venue"] && (
                <span className="form-error-msg">{errors["meetingDetails.venue"]}</span>
              )}
            </div>

            {/* Agenda (What will be discussed) */}
            <div className={`form-group full-width ${errors["meetingDetails.planningAgenda"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="planningAgenda">
                Meeting Agenda (What will be discussed) <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (Enter list of topics, goals, and discussions planned for the meeting...)
                </span>
              </label>
              <textarea
                id="planningAgenda"
                name="planningAgenda"
                value={formData.meetingDetails.planningAgenda}
                onChange={handleTextChange}
                className="form-textarea"
              />
              {errors["meetingDetails.planningAgenda"] && (
                <span className="form-error-msg">{errors["meetingDetails.planningAgenda"]}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          IF SUBMITTING MEETING MINUTES
          ======================================================== */}
      {formData.meetingDetails.meetingSubtype === "minutes" && (
        <div className="section-card-wrapper" id="meeting-minutes-details" style={{ animation: "modalFadeIn 0.35s ease" }}>
          <h4 style={{ color: "var(--pa-blue)", marginBottom: "1.2rem", fontSize: "1.1rem", borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            Meeting Minutes & Attendance
          </h4>

          <div className="form-grid">
            {/* Agenda (What was discussed) */}
            <div className={`form-group full-width ${errors["meetingDetails.minutesAgenda"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="minutesAgenda">
                Meeting Agenda (What was discussed) <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (List topics and agenda items that were discussed during the session...)
                </span>
              </label>
              <textarea
                id="minutesAgenda"
                name="minutesAgenda"
                value={formData.meetingDetails.minutesAgenda}
                onChange={handleTextChange}
                className="form-textarea"
              />
              {errors["meetingDetails.minutesAgenda"] && (
                <span className="form-error-msg">{errors["meetingDetails.minutesAgenda"]}</span>
              )}
            </div>

            {/* Key Takeaways */}
            <div className={`form-group full-width ${errors["meetingDetails.keyTakeaways"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="keyTakeaways">
                Key Takeaways (What was achieved or decided) <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (Summarize main resolutions, consensus, or decisions approved in the meeting...)
                </span>
              </label>
              <textarea
                id="keyTakeaways"
                name="keyTakeaways"
                value={formData.meetingDetails.keyTakeaways}
                onChange={handleTextChange}
                className="form-textarea"
              />
              {errors["meetingDetails.keyTakeaways"] && (
                <span className="form-error-msg">{errors["meetingDetails.keyTakeaways"]}</span>
              )}
            </div>

            {/* Follow-up Actions */}
            <div className={`form-group full-width ${errors["meetingDetails.followUpActions"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="followUpActions">
                Follow-up Actions <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (Specify task descriptions, assigned members, and deadlines...)
                </span>
              </label>
              <textarea
                id="followUpActions"
                name="followUpActions"
                value={formData.meetingDetails.followUpActions}
                onChange={handleTextChange}
                className="form-textarea"
              />
              {errors["meetingDetails.followUpActions"] && (
                <span className="form-error-msg">{errors["meetingDetails.followUpActions"]}</span>
              )}
            </div>

            {/* Attendance */}
            <div className={`form-group full-width ${errors["meetingDetails.attendance"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="attendance">
                Attendance <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (List names of all participants present, absent with apology, or guest invites...)
                </span>
              </label>
              <textarea
                id="attendance"
                name="attendance"
                value={formData.meetingDetails.attendance}
                onChange={handleTextChange}
                className="form-textarea"
              />
              {errors["meetingDetails.attendance"] && (
                <span className="form-error-msg">{errors["meetingDetails.attendance"]}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
