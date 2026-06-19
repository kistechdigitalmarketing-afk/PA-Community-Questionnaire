"use client";

import React, { useState, useEffect } from "react";
import { FormData, PA_PROGRAMS } from "../data/formData";

interface FormPreviewProps {
  formData: FormData;
  isSubmitted?: boolean;
}

export default function FormPreview({ formData, isSubmitted = false }: FormPreviewProps) {
  const selectedProgramName =
    PA_PROGRAMS.find((p) => p.id === formData.programId)?.name || "";

  return (
    <div id="form-preview-container">
      {!isSubmitted && (
        <>
          <h3 className="section-subtitle" style={{ fontSize: "1.35rem", marginBottom: "1.5rem" }}>
            Review & Verify Details
          </h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
            Please review all the information below before clicking Final Submit. If you need to make changes, you can click "Back".
          </p>
        </>
      )}

      {/* SECTION A SUMMARY */}
      <div className="history-card" style={{ marginBottom: "2rem", borderColor: "var(--pa-yellow)" }}>
        <div className="preview-header" style={{ backgroundColor: "var(--pa-navy)" }}>
          <h4 style={{ color: "white", fontSize: "1.1rem" }}>Section A: Community Information</h4>
          <span className="preview-type-badge" style={{ backgroundColor: "var(--pa-yellow)", color: "var(--pa-navy)" }}>
            General
          </span>
        </div>
        <div className="preview-body">
          <div className="preview-grid">
            <div className="preview-item">
              <span className="preview-label">Country Name</span>
              <span className="preview-val">{formData.countryName}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Catchment Area</span>
              <span className="preview-val">{formData.catchmentArea}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Community Name</span>
              <span className="preview-val">{formData.communityName}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">CMC</span>
              <span className="preview-val">{formData.cmc}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Date Established</span>
              <span className="preview-val">{formData.dateEstablished}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Number of Shalom Leaders</span>
              <span className="preview-val">{formData.shalomLeadersCount}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Leader Providing Information</span>
              <span className="preview-val">{formData.leaderName}</span>
            </div>
            <div className="preview-item full-width" style={{ gridColumn: "span 2" }}>
              <span className="preview-label">Phone Number</span>
              <span className="preview-val">{formData.contactInfo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B, C OR D SUMMARY */}
      {formData.submissionType === "activity_event" ? (
        <div className="history-card" style={{ marginBottom: "2rem", borderColor: "var(--pa-blue)" }}>
          <div className="preview-header">
            <h4 style={{ color: "white", fontSize: "1.1rem" }}>
              Sections B & C: Activity / Event details
            </h4>
            <span className="preview-type-badge">
              {formData.activitySubtype === "planning" ? "Planning" : "Reporting"}
            </span>
          </div>
          <div className="preview-body">
            <div className="preview-grid">
              <div className="preview-item" style={{ gridColumn: "span 2" }}>
                <span className="preview-label">Activity Title</span>
                <span className="preview-val" style={{ fontSize: "1.1rem", color: "var(--pa-blue)" }}>
                  {formData.activityTitle}
                </span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Program Name</span>
                <span className="preview-val">{selectedProgramName}</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Program Pillar & Project (PPP)</span>
                <span className="preview-val">{formData.pppSelected}</span>
              </div>
              <div className="preview-item" style={{ gridColumn: "span 2" }}>
                <span className="preview-label">Activity Type(s)</span>
                <span className="preview-val">
                  {formData.activityTypesSelected.join(", ") || "None selected"}
                </span>
              </div>
            </div>

            {/* Reporting Specific Details */}
            {formData.activitySubtype === "reporting" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                <div className="preview-item">
                  <span className="preview-label">What was done, why, and how</span>
                  <div className="preview-textarea-val">{formData.reportingDetails.whatWhyHow}</div>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Outcomes (What was achieved)</span>
                  <div className="preview-textarea-val">{formData.reportingDetails.outcomes}</div>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Present Participants</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
                    {formData.reportingDetails.participants && formData.reportingDetails.participants.length > 0 ? (
                      formData.reportingDetails.participants.map((p, idx) => (
                        <span key={idx} style={{
                          display: "inline-block",
                          backgroundColor: "#ebf8ff",
                          color: "#2b6cb0",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          fontWeight: 500
                        }}>
                          👤 {p}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>None listed</span>
                    )}
                  </div>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Next Steps & Follow-up Actions</span>
                  <div className="preview-textarea-val">{formData.reportingDetails.nextSteps}</div>
                </div>

                <div className="preview-item" style={{ backgroundColor: "#f7fafc", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)" }}>
                  <span className="preview-label" style={{ marginBottom: "0.75rem" }}>Resources Utilized</span>
                  {formData.reportingDetails.resourcesUtilized.types.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {formData.reportingDetails.resourcesUtilized.types.map((type) => {
                        const desc = formData.reportingDetails.resourcesUtilized.descriptions?.[type] || "";
                        const providers = formData.reportingDetails.resourcesUtilized.providersMap?.[type] || [];
                        const specifyOther = formData.reportingDetails.resourcesUtilized.providerSpecifyOthers?.[type] || "";

                        return (
                          <div key={type} style={{
                            backgroundColor: "white",
                            padding: "1rem",
                            borderRadius: "var(--border-radius-md)",
                            border: "1px solid var(--border-color)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                          }}>
                            <div style={{ fontWeight: "bold", color: "var(--pa-navy)", marginBottom: "0.5rem", fontSize: "0.95rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
                              {type}
                            </div>
                            <div style={{ marginBottom: "0.75rem" }}>
                              <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Explanation:</span>
                              <div style={{ fontSize: "0.9rem", whiteSpace: "pre-line", color: "var(--text-main)" }}>
                                {desc || "None provided"}
                              </div>
                            </div>
                            <div>
                              <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Provider(s):</span>
                              <div style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 500 }}>
                                {providers.length > 0 ? (
                                  providers.map((p) => {
                                    if (p === "pa") return "Possibilities Africa";
                                    if (p === "self") return "Self Raised";
                                    if (p === "other") return `Another Organization (${specifyOther || "Not specified"})`;
                                    return p;
                                  }).join(", ")
                                ) : (
                                  "None selected"
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>None utilized</div>
                  )}
                </div>
              </div>
            )}

            {/* Planning Specific Details */}
            {formData.activitySubtype === "planning" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                <div className="preview-item">
                  <span className="preview-label">What is planned, why, and how</span>
                  <div className="preview-textarea-val">{formData.planningDetails.whatWhyHow}</div>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Expected Outcomes</span>
                  <div className="preview-textarea-val">{formData.planningDetails.expectedOutcomes}</div>
                </div>

                <div className="preview-item" style={{ backgroundColor: "#f7fafc", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)" }}>
                  <span className="preview-label" style={{ marginBottom: "0.75rem" }}>Resources Needed</span>
                  {formData.planningDetails.resourcesNeeded.types.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {formData.planningDetails.resourcesNeeded.types.map((type) => {
                        const desc = formData.planningDetails.resourcesNeeded.descriptions?.[type] || "";
                        const methods = formData.planningDetails.resourcesNeeded.acquisitionMethodsMap?.[type] || [];
                        const specifyOther = formData.planningDetails.resourcesNeeded.acquisitionSpecifyOthers?.[type] || "";

                        return (
                          <div key={type} style={{
                            backgroundColor: "white",
                            padding: "1rem",
                            borderRadius: "var(--border-radius-md)",
                            border: "1px solid var(--border-color)",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                          }}>
                            <div style={{ fontWeight: "bold", color: "var(--pa-navy)", marginBottom: "0.5rem", fontSize: "0.95rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
                              {type}
                            </div>
                            <div style={{ marginBottom: "0.75rem" }}>
                              <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Explanation:</span>
                              <div style={{ fontSize: "0.9rem", whiteSpace: "pre-line", color: "var(--text-main)" }}>
                                {desc || "None provided"}
                              </div>
                            </div>
                            <div>
                              <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Acquisition Method(s):</span>
                              <div style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 500 }}>
                                {methods.length > 0 ? (
                                  methods.map((m) => {
                                    if (m === "pa") return "Possibilities Africa";
                                    if (m === "self") return "Self Raised";
                                    if (m === "other") return `Another Organization (${specifyOther || "Not specified"})`;
                                    return m;
                                  }).join(", ")
                                ) : (
                                  "None selected"
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>None needed</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SECTION D: MEETING MINUTES / PLANNING */
        <div className="history-card" style={{ marginBottom: "2rem", borderColor: "var(--pa-blue)" }}>
          <div className="preview-header">
            <h4 style={{ color: "white", fontSize: "1.1rem" }}>
              Sections B & D: Meeting details
            </h4>
            <span className="preview-type-badge">
              {formData.meetingDetails.meetingSubtype === "planning" ? "Planning" : "Minutes"}
            </span>
          </div>
          <div className="preview-body">
            <div className="preview-grid">
              <div className="preview-item" style={{ gridColumn: "span 2" }}>
                <span className="preview-label">Meeting Title</span>
                <span className="preview-val" style={{ fontSize: "1.1rem", color: "var(--pa-blue)" }}>
                  {formData.meetingDetails.meetingTitle}
                </span>
              </div>
              
              {formData.meetingDetails.meetingSubtype === "planning" && (
                <>
                  <div className="preview-item">
                    <span className="preview-label">Date & Time of Meeting</span>
                    <span className="preview-val">
                      {new Date(formData.meetingDetails.dateAndTime).toLocaleString() || ""}
                    </span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Venue</span>
                    <span className="preview-val">{formData.meetingDetails.venue}</span>
                  </div>
                  <div className="preview-item" style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                    <span className="preview-label">Meeting Agenda (To be discussed)</span>
                    <div className="preview-textarea-val">{formData.meetingDetails.planningAgenda}</div>
                  </div>
                </>
              )}

              {formData.meetingDetails.meetingSubtype === "minutes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", gridColumn: "span 2", width: "100%" }}>
                  <div className="preview-item">
                    <span className="preview-label">Meeting Agenda (What was discussed)</span>
                    <div className="preview-textarea-val">{formData.meetingDetails.minutesAgenda}</div>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Key Takeaways (What was achieved/decided)</span>
                    <div className="preview-textarea-val">{formData.meetingDetails.keyTakeaways}</div>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Follow-up Actions</span>
                    <div className="preview-textarea-val">{formData.meetingDetails.followUpActions}</div>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Attendance</span>
                    <div className="preview-textarea-val">{formData.meetingDetails.attendance}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

     {/* ATTACHED DOCUMENTS SUMMARY */}
{formData.documents && formData.documents.length > 0 && (
  <div
    className="history-card"
    style={{
      marginBottom: "2rem",
      borderColor: "var(--pa-blue)",
    }}
  >
    <div
      className="preview-header"
      style={{ backgroundColor: "var(--pa-navy)" }}
    >
      <h4
        style={{
          color: "white",
          fontSize: "1.1rem",
        }}
      >
        Attached Documents
      </h4>

      <span
        className="preview-type-badge"
        style={{
          backgroundColor: "var(--pa-blue)",
        }}
      >
        Files ({formData.documents.length})
      </span>
    </div>

    <div className="preview-body">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {formData.documents.map((file, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem",
              backgroundColor: "var(--bg-main)",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span
  style={{
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "var(--pa-blue)",
  }}
>
  {file.name}
</span>

              <a
                href={file.base64}
                download={file.name}
                className="btn btn-secondary"
                style={{
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.75rem",
                  textDecoration: "none",
                }}
              >
                ⬇ Download
              </a>
            </div>

            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                fontWeight: "bold",
              }}
            >
              {Math.round(file.size / 1024)} KB
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
