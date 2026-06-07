"use client";

import React, { useEffect } from "react";
import {
  QuestionnaireData,
  PA_PROGRAMS,
  ACTIVITY_TYPES,
  RESOURCE_TYPES,
  RESOURCE_PROVIDERS,
  ActivitySubtype,
} from "../data/questionnaireData";

interface SectionCProps {
  formData: QuestionnaireData;
  onChange: (updates: Partial<QuestionnaireData>) => void;
  errors: Record<string, string>;
}

export default function SectionC({ formData, onChange, errors }: SectionCProps) {
  const selectedProgram = PA_PROGRAMS.find((p) => p.id === formData.programId);

  // Clear PPP selection if program changes and does not match the program's PPPs, or if program becomes empty
  useEffect(() => {
    if (!formData.programId) {
      onChange({ pppSelected: "" });
    } else if (selectedProgram && !selectedProgram.ppps.includes(formData.pppSelected)) {
      onChange({ pppSelected: "" });
    }
  }, [formData.programId]);

  // Clear activityTypesSelected if pppSelected is cleared
  useEffect(() => {
    if (!formData.pppSelected && formData.activityTypesSelected.length > 0) {
      onChange({ activityTypesSelected: [] });
    }
  }, [formData.pppSelected]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleSubtypeChange = (subtype: ActivitySubtype) => {
    onChange({ activitySubtype: subtype });
  };

  // Activity Type Selection (Single Select)
  const handleActivityTypeSelect = (type: string) => {
    onChange({ activityTypesSelected: [type] });
  };

  // Reporting Resources Types Checkboxes
  const handleReportingResourceTypeToggle = (type: string) => {
    const current = formData.reportingDetails.resourcesUtilized.types;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    
    // Recalculate maps and combined values for updated types
    const currentDescriptions = formData.reportingDetails.resourcesUtilized.descriptions || {};
    const currentProvidersMap = formData.reportingDetails.resourcesUtilized.providersMap || {};
    const currentSpecifyOthers = formData.reportingDetails.resourcesUtilized.providerSpecifyOthers || {};

    const filteredDescriptions: Record<string, string> = {};
    const filteredProvidersMap: Record<string, string[]> = {};
    const filteredSpecifyOthers: Record<string, string> = {};

    updated.forEach((t) => {
      filteredDescriptions[t] = currentDescriptions[t] || "";
      filteredProvidersMap[t] = currentProvidersMap[t] || [];
      filteredSpecifyOthers[t] = currentSpecifyOthers[t] || "";
    });

    const combinedDesc = Object.entries(filteredDescriptions)
      .filter(([_, val]) => val.trim())
      .map(([key, val]) => `[${key}] ${val}`)
      .join("\n\n");

    const allProviders = Array.from(new Set(Object.values(filteredProvidersMap).flat()));

    const combinedSpecifyOther = Object.entries(filteredSpecifyOthers)
      .filter(([_, val]) => val.trim())
      .map(([key, val]) => `[${key}] ${val}`)
      .join(", ");
    
    onChange({
      reportingDetails: {
        ...formData.reportingDetails,
        resourcesUtilized: {
          ...formData.reportingDetails.resourcesUtilized,
          types: updated,
          descriptions: filteredDescriptions,
          description: combinedDesc,
          providersMap: filteredProvidersMap,
          providers: allProviders,
          providerSpecifyOthers: filteredSpecifyOthers,
          providerSpecifyOther: combinedSpecifyOther,
        },
      },
    });
  };

  // Reporting description change handler (per resource type)
  const handleReportingDescriptionChange = (type: string) => {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      const updatedDescriptions = {
        ...(formData.reportingDetails.resourcesUtilized.descriptions || {}),
        [type]: value,
      };

      // Recalculate combined description for compatibility
      const selectedTypes = formData.reportingDetails.resourcesUtilized.types;
      const filteredDescriptions: Record<string, string> = {};
      selectedTypes.forEach((t) => {
        filteredDescriptions[t] = updatedDescriptions[t] || "";
      });

      const combinedDesc = Object.entries(filteredDescriptions)
        .filter(([_, val]) => val.trim())
        .map(([key, val]) => `[${key}] ${val}`)
        .join("\n\n");

      onChange({
        reportingDetails: {
          ...formData.reportingDetails,
          resourcesUtilized: {
            ...formData.reportingDetails.resourcesUtilized,
            descriptions: filteredDescriptions,
            description: combinedDesc,
          },
        },
      });
    };
  };

  // Reporting Resource Providers Checkboxes (per resource type)
  const handleReportingProviderToggle = (resourceType: string, providerId: string) => {
    const currentMap = formData.reportingDetails.resourcesUtilized.providersMap || {};
    const current = currentMap[resourceType] || [];
    const updated = current.includes(providerId)
      ? current.filter((p) => p !== providerId)
      : [...current, providerId];

    const updatedMap = {
      ...currentMap,
      [resourceType]: updated,
    };

    // Calculate flat list of all unique providers for backward compatibility
    const allProviders = Array.from(new Set(Object.values(updatedMap).flat()));

    onChange({
      reportingDetails: {
        ...formData.reportingDetails,
        resourcesUtilized: {
          ...formData.reportingDetails.resourcesUtilized,
          providersMap: updatedMap,
          providers: allProviders,
        },
      },
    });
  };

  // Reporting custom organization name change (per resource type)
  const handleReportingProviderSpecifyOtherChange = (resourceType: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const currentSpecifyOthers = formData.reportingDetails.resourcesUtilized.providerSpecifyOthers || {};
      const updatedSpecifyOthers = {
        ...currentSpecifyOthers,
        [resourceType]: value,
      };

      // Calculate flat specify other string for backward-compatibility
      const combinedSpecifyOther = Object.entries(updatedSpecifyOthers)
        .filter(([_, val]) => val.trim())
        .map(([key, val]) => `[${key}] ${val}`)
        .join(", ");

      onChange({
        reportingDetails: {
          ...formData.reportingDetails,
          resourcesUtilized: {
            ...formData.reportingDetails.resourcesUtilized,
            providerSpecifyOthers: updatedSpecifyOthers,
            providerSpecifyOther: combinedSpecifyOther,
          },
        },
      });
    };
  };

  // Reporting text details (whatWhyHow, outcomes, nextSteps)
  const handleReportingTextChange = (
    field: "whatWhyHow" | "outcomes" | "nextSteps"
  ) => {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const { value } = e.target;
      onChange({
        reportingDetails: {
          ...formData.reportingDetails,
          [field]: value,
        },
      });
    };
  };

  // Participant List Handlers
  const handleAddParticipant = () => {
    onChange({
      reportingDetails: {
        ...formData.reportingDetails,
        participants: [...formData.reportingDetails.participants, ""],
      },
    });
  };

  const handleRemoveParticipant = (indexToRemove: number) => {
    const updated = formData.reportingDetails.participants.filter(
      (_, idx) => idx !== indexToRemove
    );
    onChange({
      reportingDetails: {
        ...formData.reportingDetails,
        participants: updated.length === 0 ? [""] : updated,
      },
    });
  };

  const handleParticipantChange = (index: number, value: string) => {
    const updated = [...formData.reportingDetails.participants];
    updated[index] = value;
    onChange({
      reportingDetails: {
        ...formData.reportingDetails,
        participants: updated,
      },
    });
  };

  // Planning Resource Types Checkboxes
  const handlePlanningResourceTypeToggle = (type: string) => {
    const current = formData.planningDetails.resourcesNeeded.types;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];

    // Recalculate maps and combined values for updated types
    const currentDescriptions = formData.planningDetails.resourcesNeeded.descriptions || {};
    const currentMethodsMap = formData.planningDetails.resourcesNeeded.acquisitionMethodsMap || {};
    const currentSpecifyOthers = formData.planningDetails.resourcesNeeded.acquisitionSpecifyOthers || {};

    const filteredDescriptions: Record<string, string> = {};
    const filteredMethodsMap: Record<string, string[]> = {};
    const filteredSpecifyOthers: Record<string, string> = {};

    updated.forEach((t) => {
      filteredDescriptions[t] = currentDescriptions[t] || "";
      filteredMethodsMap[t] = currentMethodsMap[t] || [];
      filteredSpecifyOthers[t] = currentSpecifyOthers[t] || "";
    });

    const combinedDesc = Object.entries(filteredDescriptions)
      .filter(([_, val]) => val.trim())
      .map(([key, val]) => `[${key}] ${val}`)
      .join("\n\n");

    const allMethods = Array.from(new Set(Object.values(filteredMethodsMap).flat()));

    const combinedSpecifyOther = Object.entries(filteredSpecifyOthers)
      .filter(([_, val]) => val.trim())
      .map(([key, val]) => `[${key}] ${val}`)
      .join(", ");

    onChange({
      planningDetails: {
        ...formData.planningDetails,
        resourcesNeeded: {
          ...formData.planningDetails.resourcesNeeded,
          types: updated,
          descriptions: filteredDescriptions,
          description: combinedDesc,
          acquisitionMethodsMap: filteredMethodsMap,
          acquisitionMethods: allMethods,
          acquisitionSpecifyOthers: filteredSpecifyOthers,
          acquisitionSpecifyOther: combinedSpecifyOther,
        },
      },
    });
  };

  // Planning description change handler (per resource type)
  const handlePlanningDescriptionChange = (type: string) => {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      const updatedDescriptions = {
        ...(formData.planningDetails.resourcesNeeded.descriptions || {}),
        [type]: value,
      };

      // Recalculate combined description for compatibility
      const selectedTypes = formData.planningDetails.resourcesNeeded.types;
      const filteredDescriptions: Record<string, string> = {};
      selectedTypes.forEach((t) => {
        filteredDescriptions[t] = updatedDescriptions[t] || "";
      });

      const combinedDesc = Object.entries(filteredDescriptions)
        .filter(([_, val]) => val.trim())
        .map(([key, val]) => `[${key}] ${val}`)
        .join("\n\n");

      onChange({
        planningDetails: {
          ...formData.planningDetails,
          resourcesNeeded: {
            ...formData.planningDetails.resourcesNeeded,
            descriptions: filteredDescriptions,
            description: combinedDesc,
          },
        },
      });
    };
  };

  // Planning Resource Acquisition Method Checkboxes (per resource type)
  const handlePlanningAcquisitionToggle = (resourceType: string, methodId: string) => {
    const currentMap = formData.planningDetails.resourcesNeeded.acquisitionMethodsMap || {};
    const current = currentMap[resourceType] || [];
    const updated = current.includes(methodId)
      ? current.filter((m) => m !== methodId)
      : [...current, methodId];

    const updatedMap = {
      ...currentMap,
      [resourceType]: updated,
    };

    // Calculate flat list of all unique methods for backward compatibility
    const allMethods = Array.from(new Set(Object.values(updatedMap).flat()));

    onChange({
      planningDetails: {
        ...formData.planningDetails,
        resourcesNeeded: {
          ...formData.planningDetails.resourcesNeeded,
          acquisitionMethodsMap: updatedMap,
          acquisitionMethods: allMethods,
        },
      },
    });
  };

  // Planning custom organization name change (per resource type)
  const handlePlanningAcquisitionSpecifyOtherChange = (resourceType: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const currentSpecifyOthers = formData.planningDetails.resourcesNeeded.acquisitionSpecifyOthers || {};
      const updatedSpecifyOthers = {
        ...currentSpecifyOthers,
        [resourceType]: value,
      };

      // Calculate flat specify other string for backward-compatibility
      const combinedSpecifyOther = Object.entries(updatedSpecifyOthers)
        .filter(([_, val]) => val.trim())
        .map(([key, val]) => `[${key}] ${val}`)
        .join(", ");

      onChange({
        planningDetails: {
          ...formData.planningDetails,
          resourcesNeeded: {
            ...formData.planningDetails.resourcesNeeded,
            acquisitionSpecifyOthers: updatedSpecifyOthers,
            acquisitionSpecifyOther: combinedSpecifyOther,
          },
        },
      });
    };
  };

  // Planning text details (whatWhyHow, expectedOutcomes)
  const handlePlanningTextChange = (
    field: "whatWhyHow" | "expectedOutcomes"
  ) => {
    return (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const { value } = e.target;
      onChange({
        planningDetails: {
          ...formData.planningDetails,
          [field]: value,
        },
      });
    };
  };

  return (
    <div id="section-c-container">
      <h3 className="section-subtitle" style={{ fontSize: "1.35rem", marginBottom: "1.5rem" }}>
        Section C: Activity / Event Reporting or Planning
      </h3>

      <div className="form-grid" style={{ marginBottom: "2rem" }}>
        {/* Title of the Activity/Event */}
        <div className={`form-group full-width ${errors.activityTitle ? "error" : ""}`}>
          <label className="form-label" htmlFor="activityTitle">
            Title of the Activity/Event <span className="required-dot">*</span>
            <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
              (e.g. Youth Leadership Conference)
            </span>
          </label>
          <input
            type="text"
            id="activityTitle"
            name="activityTitle"
            value={formData.activityTitle}
            onChange={handleTextChange}
            className="form-input"
          />
          {errors.activityTitle && <span className="form-error-msg">{errors.activityTitle}</span>}
        </div>

        {/* Activity Subtype Choice */}
        <div className="form-group full-width" style={{ marginTop: "0.5rem" }}>
          <label className="form-label">
            Select Activity Action <span className="required-dot">*</span>
          </label>
          {errors.activitySubtype && <span className="form-error-msg" style={{ marginBottom: "0.5rem" }}>{errors.activitySubtype}</span>}
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
            <button
              type="button"
              className={`btn ${formData.activitySubtype === "planning" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, padding: "0.6rem" }}
              onClick={() => handleSubtypeChange("planning")}
              id="btn-subtype-planning"
            >
              📅 Planning an Activity/Event
            </button>
            <button
              type="button"
              className={`btn ${formData.activitySubtype === "reporting" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, padding: "0.6rem" }}
              onClick={() => handleSubtypeChange("reporting")}
              id="btn-subtype-reporting"
            >
              📝 Reporting an Activity/Event (Already Happened)
            </button>
          </div>
        </div>

        {/* Program Selection */}
        <div className={`form-group ${errors.programId ? "error" : ""}`}>
          <label className="form-label" htmlFor="programId">
            Select Program <span className="required-dot">*</span>
          </label>
          <select
            id="programId"
            name="programId"
            value={formData.programId}
            onChange={handleTextChange}
            className="form-select"
          >
            <option value="">-- Choose Program --</option>
            {PA_PROGRAMS.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
          {errors.programId && <span className="form-error-msg">{errors.programId}</span>}
        </div>

        {/* Dynamic PPP Selection */}
        <div className={`form-group ${errors.pppSelected ? "error" : ""}`}>
          <label className="form-label">
            Select PPP <span className="required-dot">*</span>
          </label>
          {errors.pppSelected && <span className="form-error-msg">{errors.pppSelected}</span>}
          
          {!formData.programId ? (
            <div style={{ padding: "0.75rem", border: "1.5px dashed var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Please select a Program first to view PPP options.
            </div>
          ) : (
            <div className="card-selection-list">
              {selectedProgram?.ppps.map((ppp) => (
                <div
                  key={ppp}
                  className={`selection-card ${formData.pppSelected === ppp ? "selected" : ""}`}
                  onClick={() => onChange({ pppSelected: ppp })}
                >
                  <input
                    type="radio"
                    name="pppSelected"
                    checked={formData.pppSelected === ppp}
                    onChange={() => {}} // Controlled click via parent div
                    className="radio-input"
                  />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{ppp}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Type Radios (Show only when PPP is selected) */}
        {formData.pppSelected && (
          <div className={`form-group full-width ${errors.activityTypesSelected ? "error" : ""}`}>
            <label className="form-label">
              Activity Type <span className="required-dot">*</span> <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.75rem" }}>(Select one)</span>
            </label>
            {errors.activityTypesSelected && <span className="form-error-msg">{errors.activityTypesSelected}</span>}
            <div className="custom-checkbox-grid">
              {ACTIVITY_TYPES.map((type) => (
                <label key={type} className="radio-label">
                  <input
                    type="radio"
                    name="activityType"
                    checked={formData.activityTypesSelected.includes(type)}
                    onChange={() => handleActivityTypeSelect(type)}
                    className="radio-input"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          IF REPORTING AN ACTIVITY/EVENT (ALREADY HAPPENED)
          ======================================================== */}
      {formData.activitySubtype === "reporting" && (
        <div className="section-card-wrapper" id="reporting-subtype-details" style={{ animation: "modalFadeIn 0.35s ease" }}>
          <h4 style={{ color: "var(--pa-blue)", marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            Reporting Activity Details
          </h4>
          
          <div className="form-grid">
            {/* 1. What was done, why, how */}
            <div className={`form-group full-width ${errors["reportingDetails.whatWhyHow"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="repWhatWhyHow">
                1. Explain what you did, why, and how <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (Give a detailed summary of the event activities, the goal/reason, and the execution process...)
                </span>
              </label>
              <textarea
                id="repWhatWhyHow"
                value={formData.reportingDetails.whatWhyHow}
                onChange={handleReportingTextChange("whatWhyHow")}
                className="form-textarea"
              />
              {errors["reportingDetails.whatWhyHow"] && (
                <span className="form-error-msg">{errors["reportingDetails.whatWhyHow"]}</span>
              )}
            </div>

            {/* 2. Outcomes */}
            <div className={`form-group full-width ${errors["reportingDetails.outcomes"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="repOutcomes">
                2. Outcomes (What was achieved) <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (Describe key results, attendance, decisions made, or direct benefits to the community...)
                </span>
              </label>
              <textarea
                id="repOutcomes"
                value={formData.reportingDetails.outcomes}
                onChange={handleReportingTextChange("outcomes")}
                className="form-textarea"
              />
              {errors["reportingDetails.outcomes"] && (
                <span className="form-error-msg">{errors["reportingDetails.outcomes"]}</span>
              )}
            </div>

            {/* 3. Present Participants */}
            <div className="form-group full-width" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ marginBottom: "0.25rem" }}>
                3. Present Participants <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (Add the names of participants present at this activity)
                </span>
              </label>

              {errors["reportingDetails.participants"] && (
                <span className="form-error-msg" style={{ display: "block", marginBottom: "0.5rem" }}>
                  {errors["reportingDetails.participants"]}
                </span>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                {formData.reportingDetails.participants.map((name, idx) => {
                  const errorKey = `reportingDetails.participants.${idx}`;
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => handleParticipantChange(idx, e.target.value)}
                          placeholder="Enter participant name"
                          className={`form-input ${errors[errorKey] ? "error" : ""}`}
                          style={{ flex: 1 }}
                        />
                        {formData.reportingDetails.participants.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipant(idx)}
                            className="btn btn-secondary"
                            style={{
                              padding: "0.6rem 0.9rem",
                              backgroundColor: "#fff0f0",
                              color: "#e53e3e",
                              borderColor: "#fed7d7",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.1rem",
                              lineHeight: 1
                            }}
                            title="Remove participant"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      {errors[errorKey] && (
                        <span className="form-error-msg">{errors[errorKey]}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddParticipant}
                className="btn btn-secondary"
                style={{
                  marginTop: "0.75rem",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                ➕ Add Participant
              </button>
            </div>

            {/* 4. Next steps */}
            <div className={`form-group full-width ${errors["reportingDetails.nextSteps"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="repNextSteps">
                4. Next Steps / Follow-up Actions <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (What are the immediate next steps or follow-up tasks required?)
                </span>
              </label>
              <textarea
                id="repNextSteps"
                value={formData.reportingDetails.nextSteps}
                onChange={handleReportingTextChange("nextSteps")}
                className="form-textarea"
              />
              {errors["reportingDetails.nextSteps"] && (
                <span className="form-error-msg">{errors["reportingDetails.nextSteps"]}</span>
              )}
            </div>

            {/* 5. Resources Utilized */}
            <div className="form-group full-width" style={{ marginTop: "1rem" }}>
              <label className="form-label" style={{ color: "var(--pa-navy)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>
                5. Resources Utilized
              </label>

              {/* Resource Type */}
              <div style={{ marginBottom: "1rem" }}>
                <span className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Resource Type</span>
                {errors["reportingDetails.resourcesUtilized.types"] && (
                  <span className="form-error-msg" style={{ display: "block", marginBottom: "0.25rem" }}>{errors["reportingDetails.resourcesUtilized.types"]}</span>
                )}
                <div className="custom-checkbox-grid" style={{ marginTop: "0.5rem" }}>
                  {RESOURCE_TYPES.map((type) => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.reportingDetails.resourcesUtilized.types.includes(type)}
                        onChange={() => handleReportingResourceTypeToggle(type)}
                        className="checkbox-input"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Resource Description Explanation */}
              {formData.reportingDetails.resourcesUtilized.types.length === 0 ? (
                <div style={{ padding: "0.75rem", border: "1.5px dashed var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Please select one or more Resource Types above to explain how they were used.
                </div>
              ) : (
                formData.reportingDetails.resourcesUtilized.types.map((type) => {
                  const errorKey = `reportingDetails.resourcesUtilized.descriptions.${type}`;
                  const providersErrorKey = `reportingDetails.resourcesUtilized.providersMap.${type}`;
                  const specifyOtherErrorKey = `reportingDetails.resourcesUtilized.providerSpecifyOthers.${type}`;

                  const selectedProviders = formData.reportingDetails.resourcesUtilized.providersMap?.[type] || [];
                  const isOtherSelected = selectedProviders.includes("other");

                  return (
                    <div key={type} style={{
                      backgroundColor: "var(--bg-main)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--border-radius-md)",
                      padding: "1.25rem",
                      marginBottom: "1.5rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                    }}>
                      <h5 style={{ color: "var(--pa-blue)", fontSize: "1.05rem", fontWeight: "bold", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
                        {type} Details
                      </h5>

                      {/* Explanation Textarea */}
                      <div className={`form-group ${errors[errorKey] ? "error" : ""}`} style={{ marginBottom: "1.25rem" }}>
                        <label className="form-label" htmlFor={`repResourceDesc-${type}`}>
                          Explain the {type} and How it was Used <span className="required-dot">*</span>
                          <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                            (Explain what specific {type.toLowerCase()} were used and how...)
                          </span>
                        </label>
                        <textarea
                          id={`repResourceDesc-${type}`}
                          value={formData.reportingDetails.resourcesUtilized.descriptions?.[type] || ""}
                          onChange={handleReportingDescriptionChange(type)}
                          className="form-textarea"
                        />
                        {errors[errorKey] && (
                          <span className="form-error-msg">{errors[errorKey]}</span>
                        )}
                      </div>

                      {/* Who Provided Checkboxes */}
                      <div style={{ marginBottom: "1rem" }}>
                        <span className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          Who Provided the {type}? <span className="required-dot">*</span>
                        </span>
                        {errors[providersErrorKey] && (
                          <span className="form-error-msg" style={{ display: "block", marginBottom: "0.25rem" }}>{errors[providersErrorKey]}</span>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                          {RESOURCE_PROVIDERS.map((prov) => (
                            <label key={prov.id} className="checkbox-label" style={{ width: "fit-content" }}>
                              <input
                                type="checkbox"
                                checked={selectedProviders.includes(prov.id)}
                                onChange={() => handleReportingProviderToggle(type, prov.id)}
                                className="checkbox-input"
                              />
                              <span>{prov.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Conditional Specify Other Provider */}
                      {isOtherSelected && (
                        <div className={`form-group ${errors[specifyOtherErrorKey] ? "error" : ""}`} style={{ marginBottom: "0.5rem" }}>
                          <label className="form-label" htmlFor={`repProviderSpecifyOther-${type}`}>
                            Specify Another Organization Name <span className="required-dot">*</span>
                            <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                              (Enter organization name)
                            </span>
                          </label>
                          <input
                            type="text"
                            id={`repProviderSpecifyOther-${type}`}
                            value={formData.reportingDetails.resourcesUtilized.providerSpecifyOthers?.[type] || ""}
                            onChange={handleReportingProviderSpecifyOtherChange(type)}
                            className="form-input"
                          />
                          {errors[specifyOtherErrorKey] && (
                            <span className="form-error-msg">{errors[specifyOtherErrorKey]}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          IF PLANNING AN ACTIVITY/EVENT
          ======================================================== */}
      {formData.activitySubtype === "planning" && (
        <div className="section-card-wrapper" id="planning-subtype-details" style={{ animation: "modalFadeIn 0.35s ease" }}>
          <h4 style={{ color: "var(--pa-blue)", marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.5rem" }}>
            Planning Activity Details
          </h4>

          <div className="form-grid">
            {/* 1. What plan to do, why, how */}
            <div className={`form-group full-width ${errors["planningDetails.whatWhyHow"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="planWhatWhyHow">
                1. Explain what you plan to do, why, and how <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (Give a detailed plan of what the upcoming event will involve, its objectives, and the implementation plan...)
                </span>
              </label>
              <textarea
                id="planWhatWhyHow"
                value={formData.planningDetails.whatWhyHow}
                onChange={handlePlanningTextChange("whatWhyHow")}
                className="form-textarea"
              />
              {errors["planningDetails.whatWhyHow"] && (
                <span className="form-error-msg">{errors["planningDetails.whatWhyHow"]}</span>
              )}
            </div>

            {/* 2. Expected Outcomes */}
            <div className={`form-group full-width ${errors["planningDetails.expectedOutcomes"] ? "error" : ""}`}>
              <label className="form-label" htmlFor="planExpectedOutcomes">
                2. Expected Outcomes <span className="required-dot">*</span>
                <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                  (What specific impacts or deliverables do you hope to achieve with this activity?)
                </span>
              </label>
              <textarea
                id="planExpectedOutcomes"
                value={formData.planningDetails.expectedOutcomes}
                onChange={handlePlanningTextChange("expectedOutcomes")}
                className="form-textarea"
              />
              {errors["planningDetails.expectedOutcomes"] && (
                <span className="form-error-msg">{errors["planningDetails.expectedOutcomes"]}</span>
              )}
            </div>

            {/* 3. Resources Needed */}
            <div className="form-group full-width" style={{ marginTop: "1rem" }}>
              <label className="form-label" style={{ color: "var(--pa-navy)", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem", marginBottom: "0.5rem" }}>
                3. Resources Needed
              </label>

              {/* Resource Type */}
              <div style={{ marginBottom: "1rem" }}>
                <span className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Resource Type</span>
                {errors["planningDetails.resourcesNeeded.types"] && (
                  <span className="form-error-msg" style={{ display: "block", marginBottom: "0.25rem" }}>{errors["planningDetails.resourcesNeeded.types"]}</span>
                )}
                <div className="custom-checkbox-grid" style={{ marginTop: "0.5rem" }}>
                  {RESOURCE_TYPES.map((type) => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.planningDetails.resourcesNeeded.types.includes(type)}
                        onChange={() => handlePlanningResourceTypeToggle(type)}
                        className="checkbox-input"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Resource Needed Explanation */}
              {formData.planningDetails.resourcesNeeded.types.length === 0 ? (
                <div style={{ padding: "0.75rem", border: "1.5px dashed var(--border-color)", borderRadius: "var(--border-radius-md)", color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  Please select one or more Resource Types above to explain how they will be used.
                </div>
              ) : (
                formData.planningDetails.resourcesNeeded.types.map((type) => {
                  const errorKey = `planningDetails.resourcesNeeded.descriptions.${type}`;
                  const methodsErrorKey = `planningDetails.resourcesNeeded.acquisitionMethodsMap.${type}`;
                  const specifyOtherErrorKey = `planningDetails.resourcesNeeded.acquisitionSpecifyOthers.${type}`;

                  const selectedMethods = formData.planningDetails.resourcesNeeded.acquisitionMethodsMap?.[type] || [];
                  const isOtherSelected = selectedMethods.includes("other");

                  return (
                    <div key={type} style={{
                      backgroundColor: "var(--bg-main)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--border-radius-md)",
                      padding: "1.25rem",
                      marginBottom: "1.5rem",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
                    }}>
                      <h5 style={{ color: "var(--pa-blue)", fontSize: "1.05rem", fontWeight: "bold", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
                        {type} Details
                      </h5>

                      {/* Explanation Textarea */}
                      <div className={`form-group ${errors[errorKey] ? "error" : ""}`} style={{ marginBottom: "1.25rem" }}>
                        <label className="form-label" htmlFor={`planResourceDesc-${type}`}>
                          Explain the {type} Needed and How it Will be Used <span className="required-dot">*</span>
                          <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                            (Explain what specific {type.toLowerCase()} are needed and their planned utilization...)
                          </span>
                        </label>
                        <textarea
                          id={`planResourceDesc-${type}`}
                          value={formData.planningDetails.resourcesNeeded.descriptions?.[type] || ""}
                          onChange={handlePlanningDescriptionChange(type)}
                          className="form-textarea"
                        />
                        {errors[errorKey] && (
                          <span className="form-error-msg">{errors[errorKey]}</span>
                        )}
                      </div>

                      {/* How Will it be Acquired Checkboxes */}
                      <div style={{ marginBottom: "1rem" }}>
                        <span className="form-label" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          How Will the {type} be Acquired? <span className="required-dot">*</span>
                        </span>
                        {errors[methodsErrorKey] && (
                          <span className="form-error-msg" style={{ display: "block", marginBottom: "0.25rem" }}>{errors[methodsErrorKey]}</span>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                          {RESOURCE_PROVIDERS.map((prov) => (
                            <label key={prov.id} className="checkbox-label" style={{ width: "fit-content" }}>
                              <input
                                type="checkbox"
                                checked={selectedMethods.includes(prov.id)}
                                onChange={() => handlePlanningAcquisitionToggle(type, prov.id)}
                                className="checkbox-input"
                              />
                              <span>{prov.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Conditional Specify Other Provider */}
                      {isOtherSelected && (
                        <div className={`form-group ${errors[specifyOtherErrorKey] ? "error" : ""}`} style={{ marginBottom: "0.5rem" }}>
                          <label className="form-label" htmlFor={`planAcquisitionSpecifyOther-${type}`}>
                            Specify Another Organization Name <span className="required-dot">*</span>
                            <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
                              (Enter organization name)
                            </span>
                          </label>
                          <input
                            type="text"
                            id={`planAcquisitionSpecifyOther-${type}`}
                            value={formData.planningDetails.resourcesNeeded.acquisitionSpecifyOthers?.[type] || ""}
                            onChange={handlePlanningAcquisitionSpecifyOtherChange(type)}
                            className="form-input"
                          />
                          {errors[specifyOtherErrorKey] && (
                            <span className="form-error-msg">{errors[specifyOtherErrorKey]}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
