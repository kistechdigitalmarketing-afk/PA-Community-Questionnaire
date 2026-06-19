"use client";

import React from "react";
import { FormData } from "../data/formData";


interface SectionDProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

export default function SectionD({
  formData,
  onChange,
  errors,
}: SectionDProps) {
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
 const handleAutoNumbering = (
  value: string,
  updateValue: (newValue: string) => void,
  e: React.KeyboardEvent<HTMLTextAreaElement>
) => {
  if (e.key !== "Enter") return;
  console.log("ENTER PRESSED");

  e.preventDefault();

  const lines = value.split("\n");

  // First Enter ever
  const hasNumbering = /^\d+\.\s/.test(lines[0]);

  if (!hasNumbering) {
    const numberedLines = lines.map((line, index) => {
      if (!line.trim()) return `${index + 1}. `;
      return `${index + 1}. ${line}`;
    });

    numberedLines.push(`${numberedLines.length + 1}. `);

    updateValue(numberedLines.join("\n"));
    return;
  }

  // Already numbered
  const lastLine = lines[lines.length - 1];
  const match = lastLine.match(/^(\d+)\.\s?/);

  if (match) {
    const nextNumber = Number(match[1]) + 1;

    updateValue(
      value + "\n" + nextNumber + ". "
    );
  }
};
  return (
    <div id="section-d-container">
      <p
        style={{
          color: "var(--text-muted)",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
        }}
      >
        Please complete the meeting details below.
      </p>

      {/* Meeting Title */}
      <div className="form-grid" style={{ marginBottom: "2rem" }}>
        <div
          className={`form-group full-width ${
            errors["meetingDetails.meetingTitle"] ? "error" : ""
          }`}
        >
          <label className="form-label" htmlFor="meetingTitle">
            Meeting Title <span className="required-dot">*</span>
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
            <span className="form-error-msg">
              {errors["meetingDetails.meetingTitle"]}
            </span>
          )}
        </div>
      </div>

      {/* =======================================================
          FUTURE MEETING PLANNING
      ======================================================= */}
      {formData.meetingDetails.meetingSubtype === "planning" && (
        <div
          className="section-card-wrapper"
          id="meeting-planning-details"
        >
          <h4
            style={{
              color: "var(--pa-blue)",
              marginBottom: "1.2rem",
              fontSize: "1.1rem",
              borderBottom: "1.5px solid var(--border-color)",
              paddingBottom: "0.5rem",
            }}
          >
            Meeting Schedule & Agenda
          </h4>

          <div className="form-grid">
            <div
              className={`form-group ${
                errors["meetingDetails.dateAndTime"] ? "error" : ""
              }`}
            >
              <label className="form-label" htmlFor="dateAndTime">
                Date & Time of Meeting
                <span className="required-dot">*</span>
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
                <span className="form-error-msg">
                  {errors["meetingDetails.dateAndTime"]}
                </span>
              )}
            </div>

            <div
              className={`form-group ${
                errors["meetingDetails.venue"] ? "error" : ""
              }`}
            >
              <label className="form-label" htmlFor="venue">
                Venue <span className="required-dot">*</span>
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
                <span className="form-error-msg">
                  {errors["meetingDetails.venue"]}
                </span>
              )}
            </div>

            <div
              className={`form-group full-width ${
                errors["meetingDetails.planningAgenda"] ? "error" : ""
              }`}
            >
              <label className="form-label" htmlFor="planningAgenda">
                Meeting Agenda
                <span className="required-dot">*</span>
              </label>

             <textarea
  id="planningAgenda"
  name="planningAgenda"
  value={formData.meetingDetails.planningAgenda}
  onChange={handleTextChange}
  onKeyDown={(e) =>
    handleAutoNumbering(
      formData.meetingDetails.planningAgenda,
      (newValue) =>
        onChange({
          meetingDetails: {
            ...formData.meetingDetails,
            planningAgenda: newValue,
          },
        }),
      e
    )
  }
  className="form-textarea"
/>

              {errors["meetingDetails.planningAgenda"] && (
                <span className="form-error-msg">
                  {errors["meetingDetails.planningAgenda"]}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          PAST MEETING MINUTES
      ======================================================= */}
      {formData.meetingDetails.meetingSubtype === "minutes" && (
        <div
          className="section-card-wrapper"
          id="meeting-minutes-details"
        >
          <h4
            style={{
              color: "var(--pa-blue)",
              marginBottom: "1.2rem",
              fontSize: "1.1rem",
              borderBottom: "1.5px solid var(--border-color)",
              paddingBottom: "0.5rem",
            }}
          >
            Meeting Minutes & Attendance
          </h4>

          <div className="form-grid">
            <div
              className={`form-group full-width ${
                errors["meetingDetails.minutesAgenda"] ? "error" : ""
              }`}
            >
              <label className="form-label" htmlFor="minutesAgenda">
                Meeting Agenda (What was discussed)
                <span className="required-dot">*</span>
              </label>

             <textarea
  id="minutesAgenda"
  name="minutesAgenda"
  value={formData.meetingDetails.minutesAgenda}
  onChange={handleTextChange}
  onKeyDown={(e) =>
    handleAutoNumbering(
      formData.meetingDetails.minutesAgenda,
      (newValue) =>
        onChange({
          meetingDetails: {
            ...formData.meetingDetails,
            minutesAgenda: newValue,
          },
        }),
      e
    )
  }
  className="form-textarea"
/>

              {errors["meetingDetails.minutesAgenda"] && (
                <span className="form-error-msg">
                  {errors["meetingDetails.minutesAgenda"]}
                </span>
              )}
            </div>

            <div
              className={`form-group full-width ${
                errors["meetingDetails.keyTakeaways"] ? "error" : ""
              }`}
            >
              <label
  style={{
    fontWeight: 700,
    textTransform: "uppercase",
  }}
>
  KEY TAKEAWAYS<span className="required">*</span>
</label>

<div
  style={{
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: "-2px",
    marginBottom: "0.5rem",
  }}
>
  (Describe key results or decisions made)
</div>

             <textarea
  id="keyTakeaways"
  name="keyTakeaways"
  value={formData.meetingDetails.keyTakeaways}
  onChange={handleTextChange}
  onKeyDown={(e) =>
    handleAutoNumbering(
      formData.meetingDetails.keyTakeaways,
      (newValue) =>
        onChange({
          meetingDetails: {
            ...formData.meetingDetails,
            keyTakeaways: newValue,
          },
        }),
      e
    )
  }
  className="form-textarea"
/>

              {errors["meetingDetails.keyTakeaways"] && (
                <span className="form-error-msg">
                  {errors["meetingDetails.keyTakeaways"]}
                </span>
              )}
            </div>

            <div
              className={`form-group full-width ${
                errors["meetingDetails.followUpActions"] ? "error" : ""
              }`}
            >
              <label className="form-label" htmlFor="followUpActions">
  Follow-up Actions
  <span className="required-dot">*</span>
</label>

<div
  style={{
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: "-2px",
    marginBottom: "0.5rem",
  }}
>
  (What are the immediate next steps or follow-up tasks required?)
</div>

             <textarea
  id="followUpActions"
  name="followUpActions"
  value={formData.meetingDetails.followUpActions}
  onChange={handleTextChange}
  onKeyDown={(e) =>
    handleAutoNumbering(
      formData.meetingDetails.followUpActions,
      (newValue) =>
        onChange({
          meetingDetails: {
            ...formData.meetingDetails,
            followUpActions: newValue,
          },
        }),
      e
    )
  }
  className="form-textarea"
/>

              {errors["meetingDetails.followUpActions"] && (
                <span className="form-error-msg">
                  {errors["meetingDetails.followUpActions"]}
                </span>
              )}
            </div>

            <div
              className={`form-group full-width ${
                errors["meetingDetails.attendance"] ? "error" : ""
              }`}
            >
              <label className="form-label" htmlFor="attendance">
                Attendance
                <span className="required-dot">*</span>
              </label>

              <textarea
  id="attendance"
  name="attendance"
  value={formData.meetingDetails.attendance}
  onChange={handleTextChange}
  onKeyDown={(e) =>
    handleAutoNumbering(
      formData.meetingDetails.attendance,
      (newValue) =>
        onChange({
          meetingDetails: {
            ...formData.meetingDetails,
            attendance: newValue,
          },
        }),
      e
    )
  }
  className="form-textarea"
/>

              {errors["meetingDetails.attendance"] && (
                <span className="form-error-msg">
                  {errors["meetingDetails.attendance"]}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}