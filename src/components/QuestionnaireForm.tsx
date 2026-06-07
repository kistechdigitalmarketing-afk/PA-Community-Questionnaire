"use client";

import React, { useState } from "react";
import SectionA from "./SectionA";
import SectionB from "./SectionB";
import SectionC from "./SectionC";
import SectionD from "./SectionD";
import FormPreview from "./FormPreview";
import {
  QuestionnaireData,
  INITIAL_QUESTIONNAIRE_STATE,
  SubmissionType,
  UploadedFile,
} from "../data/questionnaireData";

export default function QuestionnaireForm() {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<QuestionnaireData>(INITIAL_QUESTIONNAIRE_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB limit for local storage
    
    const oversized = filesArray.some((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      alert("Files must be under 1.5 MB to be saved locally.");
      return;
    }

    const promises = filesArray.map((file) => {
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            base64: reader.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((newFiles) => {
      setFormData((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), ...newFiles],
      }));
    });
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const updateFormData = (updates: Partial<QuestionnaireData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    
    // Clear errors when user types/changes fields
    const updatedKeys = Object.keys(updates);
    if (updatedKeys.length > 0) {
      setErrors((prev) => {
        const next = { ...prev };
        updatedKeys.forEach((key) => {
          delete next[key];
          
          // Clear subfield errors if parent changes
          if (key === "programId") delete next["programId"];
          if (key === "pppSelected") delete next["pppSelected"];
          if (key === "activityTitle") delete next["activityTitle"];
          if (key === "activitySubtype") {
            delete next["activitySubtype"];
            delete next["reportingDetails.whatWhyHow"];
            delete next["reportingDetails.outcomes"];
            delete next["reportingDetails.participants"];
            Object.keys(next).forEach((k) => {
              if (k.startsWith("reportingDetails.participants.")) {
                delete next[k];
              }
            });
            delete next["reportingDetails.nextSteps"];
            delete next["reportingDetails.resourcesUtilized.types"];
            delete next["reportingDetails.resourcesUtilized.providers"];
            delete next["reportingDetails.resourcesUtilized.description"];
            Object.keys(next).forEach((k) => {
              if (k.startsWith("reportingDetails.resourcesUtilized.descriptions.")) {
                delete next[k];
              }
            });

            delete next["planningDetails.whatWhyHow"];
            delete next["planningDetails.expectedOutcomes"];
            delete next["planningDetails.resourcesNeeded.types"];
            delete next["planningDetails.resourcesNeeded.acquisitionMethods"];
            delete next["planningDetails.resourcesNeeded.description"];
            Object.keys(next).forEach((k) => {
              if (k.startsWith("planningDetails.resourcesNeeded.descriptions.")) {
                delete next[k];
              }
            });
          }
          if (key === "reportingDetails") {
            const oldRep = formData.reportingDetails;
            const newRep = (updates.reportingDetails || {}) as typeof oldRep;
            if (newRep.whatWhyHow !== oldRep.whatWhyHow) delete next["reportingDetails.whatWhyHow"];
            if (newRep.outcomes !== oldRep.outcomes) delete next["reportingDetails.outcomes"];
            if (newRep.nextSteps !== oldRep.nextSteps) delete next["reportingDetails.nextSteps"];
            
            if (newRep.participants !== oldRep.participants) {
              newRep.participants.forEach((p, idx) => {
                if (p !== oldRep.participants[idx]) {
                  delete next[`reportingDetails.participants.${idx}`];
                }
              });
              delete next["reportingDetails.participants"];
            }
            
            const oldRes = oldRep.resourcesUtilized;
            const newRes = newRep.resourcesUtilized;
            if (newRes) {
              if (newRes.types !== oldRes.types) delete next["reportingDetails.resourcesUtilized.types"];
              
              const oldDescs = oldRes.descriptions || {};
              const newDescs = newRes.descriptions || {};
              Object.keys(newDescs).forEach((type) => {
                if (newDescs[type] !== oldDescs[type]) {
                  delete next[`reportingDetails.resourcesUtilized.descriptions.${type}`];
                }
              });

              const oldProvMap = oldRes.providersMap || {};
              const newProvMap = newRes.providersMap || {};
              Object.keys(newProvMap).forEach((type) => {
                if (newProvMap[type] !== oldProvMap[type]) {
                  delete next[`reportingDetails.resourcesUtilized.providersMap.${type}`];
                }
              });

              const oldSpecifyOthers = oldRes.providerSpecifyOthers || {};
              const newSpecifyOthers = newRes.providerSpecifyOthers || {};
              Object.keys(newSpecifyOthers).forEach((type) => {
                if (newSpecifyOthers[type] !== oldSpecifyOthers[type]) {
                  delete next[`reportingDetails.resourcesUtilized.providerSpecifyOthers.${type}`];
                }
              });
            }
          }
          if (key === "planningDetails") {
            const oldPlan = formData.planningDetails;
            const newPlan = (updates.planningDetails || {}) as typeof oldPlan;
            if (newPlan.whatWhyHow !== oldPlan.whatWhyHow) delete next["planningDetails.whatWhyHow"];
            if (newPlan.expectedOutcomes !== oldPlan.expectedOutcomes) delete next["planningDetails.expectedOutcomes"];
            
            const oldRes = oldPlan.resourcesNeeded;
            const newRes = newPlan.resourcesNeeded;
            if (newRes) {
              if (newRes.types !== oldRes.types) delete next["planningDetails.resourcesNeeded.types"];
              
              const oldDescs = oldRes.descriptions || {};
              const newDescs = newRes.descriptions || {};
              Object.keys(newDescs).forEach((type) => {
                if (newDescs[type] !== oldDescs[type]) {
                  delete next[`planningDetails.resourcesNeeded.descriptions.${type}`];
                }
              });

              const oldMethodsMap = oldRes.acquisitionMethodsMap || {};
              const newMethodsMap = newRes.acquisitionMethodsMap || {};
              Object.keys(newMethodsMap).forEach((type) => {
                if (newMethodsMap[type] !== oldMethodsMap[type]) {
                  delete next[`planningDetails.resourcesNeeded.acquisitionMethodsMap.${type}`];
                }
              });

              const oldSpecifyOthers = oldRes.acquisitionSpecifyOthers || {};
              const newSpecifyOthers = newRes.acquisitionSpecifyOthers || {};
              Object.keys(newSpecifyOthers).forEach((type) => {
                if (newSpecifyOthers[type] !== oldSpecifyOthers[type]) {
                  delete next[`planningDetails.resourcesNeeded.acquisitionSpecifyOthers.${type}`];
                }
              });
            }
          }
          if (key === "submissionType") {
            delete next["submissionType"];
            delete next["meetingDetails.meetingSubtype"];
            delete next["meetingDetails.meetingTitle"];
          }
        });
        return next;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 0) return true;
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.countryName.trim()) newErrors.countryName = "Country name is required";
      if (!formData.catchmentArea.trim()) newErrors.catchmentArea = "Catchment area is required";
      if (!formData.communityName.trim()) newErrors.communityName = "Community name is required";
      if (!formData.cmc.trim()) newErrors.cmc = "CMC name is required";
      if (!formData.dateEstablished.trim()) newErrors.dateEstablished = "Date established is required";
      if (!formData.shalomLeadersCount.trim()) {
        newErrors.shalomLeadersCount = "Shalom leaders count is required";
      } else if (Number(formData.shalomLeadersCount) < 0) {
        newErrors.shalomLeadersCount = "Leaders count must be 0 or more";
      }
      if (!formData.leaderName.trim()) newErrors.leaderName = "Leader name is required";
      if (!formData.contactInfo.trim()) newErrors.contactInfo = "Contact information is required";
    }

    if (currentStep === 2) {
      if (!formData.submissionType) {
        newErrors.submissionType = "Please select a submission type to proceed";
      }
    }

    if (currentStep === 3) {
      if (formData.submissionType === "activity_event") {
        if (!formData.activityTitle.trim()) newErrors.activityTitle = "Activity title is required";
        if (!formData.activitySubtype) newErrors.activitySubtype = "Please select an activity action";
        if (!formData.programId) newErrors.programId = "Please select a program";
        if (!formData.pppSelected) newErrors.pppSelected = "Please select a PPP option";
        if (formData.activityTypesSelected.length === 0) {
          newErrors.activityTypesSelected = "Select at least one activity type";
        }

        if (formData.activitySubtype === "reporting") {
          const rep = formData.reportingDetails;
          if (!rep.whatWhyHow.trim()) newErrors["reportingDetails.whatWhyHow"] = "This explanation is required";
          if (!rep.outcomes.trim()) newErrors["reportingDetails.outcomes"] = "Outcomes are required";
          
          if (!rep.participants || rep.participants.length === 0) {
            newErrors["reportingDetails.participants"] = "Please add at least one participant";
          } else {
            rep.participants.forEach((p, idx) => {
              if (!p.trim()) {
                newErrors[`reportingDetails.participants.${idx}`] = "Participant name is required";
              }
            });
          }

          if (!rep.nextSteps.trim()) newErrors["reportingDetails.nextSteps"] = "Next steps are required";
          
          if (rep.resourcesUtilized.types.length === 0) {
            newErrors["reportingDetails.resourcesUtilized.types"] = "Select at least one resource type";
          } else {
            rep.resourcesUtilized.types.forEach((type) => {
              const desc = rep.resourcesUtilized.descriptions?.[type] || "";
              if (!desc.trim()) {
                newErrors[`reportingDetails.resourcesUtilized.descriptions.${type}`] = `Please explain the ${type.toLowerCase()} used`;
              }
              const selectedProviders = rep.resourcesUtilized.providersMap?.[type] || [];
              if (selectedProviders.length === 0) {
                newErrors[`reportingDetails.resourcesUtilized.providersMap.${type}`] = `Please select who provided the ${type.toLowerCase()}`;
              } else if (
                selectedProviders.includes("other") &&
                !(rep.resourcesUtilized.providerSpecifyOthers?.[type] || "").trim()
              ) {
                newErrors[`reportingDetails.resourcesUtilized.providerSpecifyOthers.${type}`] = "Specify organization name";
              }
            });
          }
        }

        if (formData.activitySubtype === "planning") {
          const plan = formData.planningDetails;
          if (!plan.whatWhyHow.trim()) newErrors["planningDetails.whatWhyHow"] = "This explanation is required";
          if (!plan.expectedOutcomes.trim()) newErrors["planningDetails.expectedOutcomes"] = "Expected outcomes are required";
          
          if (plan.resourcesNeeded.types.length === 0) {
            newErrors["planningDetails.resourcesNeeded.types"] = "Select at least one resource type";
          } else {
            plan.resourcesNeeded.types.forEach((type) => {
              const desc = plan.resourcesNeeded.descriptions?.[type] || "";
              if (!desc.trim()) {
                newErrors[`planningDetails.resourcesNeeded.descriptions.${type}`] = `Please explain the ${type.toLowerCase()} needed`;
              }
              const selectedMethods = plan.resourcesNeeded.acquisitionMethodsMap?.[type] || [];
              if (selectedMethods.length === 0) {
                newErrors[`planningDetails.resourcesNeeded.acquisitionMethodsMap.${type}`] = `Please select how the ${type.toLowerCase()} will be acquired`;
              } else if (
                selectedMethods.includes("other") &&
                !(plan.resourcesNeeded.acquisitionSpecifyOthers?.[type] || "").trim()
              ) {
                newErrors[`planningDetails.resourcesNeeded.acquisitionSpecifyOthers.${type}`] = "Specify organization name";
              }
            });
          }
        }
      }

      if (formData.submissionType === "meeting") {
        const meet = formData.meetingDetails;
        if (!meet.meetingSubtype) {
          newErrors["meetingDetails.meetingSubtype"] = "Please select a meeting action";
        }
        if (!meet.meetingTitle.trim()) {
          newErrors["meetingDetails.meetingTitle"] = "Meeting title is required";
        }

        if (meet.meetingSubtype === "planning") {
          if (!meet.dateAndTime.trim()) newErrors["meetingDetails.dateAndTime"] = "Meeting date and time is required";
          if (!meet.venue.trim()) newErrors["meetingDetails.venue"] = "Venue is required";
          if (!meet.planningAgenda.trim()) newErrors["meetingDetails.planningAgenda"] = "Meeting agenda is required";
        }

        if (meet.meetingSubtype === "minutes") {
          if (!meet.minutesAgenda.trim()) newErrors["meetingDetails.minutesAgenda"] = "Meeting agenda is required";
          if (!meet.keyTakeaways.trim()) newErrors["meetingDetails.keyTakeaways"] = "Key takeaways are required";
          if (!meet.followUpActions.trim()) newErrors["meetingDetails.followUpActions"] = "Follow-up actions are required";
          if (!meet.attendance.trim()) newErrors["meetingDetails.attendance"] = "Attendance list is required";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    // Generate unique ID and metadata
    const submissionId = "PAQ-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const finalData: QuestionnaireData = {
      ...formData,
      id: submissionId,
      timestamp: Date.now(),
    };

    // Save to LocalStorage
    try {
      const existing = localStorage.getItem("pa_questionnaires");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(finalData);
      localStorage.setItem("pa_questionnaires", JSON.stringify(list));
      
      setSubmittedId(submissionId);
      setStep(5); // Success state
    } catch (err) {
      console.error("Failed to save submission locally", err);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_QUESTIONNAIRE_STATE);
    setErrors({});
    setStep(0);
  };

  // Stepper UI helper
  const renderStepper = () => {
    if (step === 0 || step > 4) return null; // Hide stepper on instructions or success screen
    
    const stepsInfo = [
      { num: 1, label: "Community Info" },
      { num: 2, label: "Submission Type" },
      { num: 3, label: "Detailed Fields" },
      { num: 4, label: "Preview & Submit" },
    ];

    return (
      <div className="stepper" id="form-stepper">
        {stepsInfo.map((s) => {
          let stateClass = "";
          if (step === s.num) stateClass = "active";
          else if (step > s.num) stateClass = "completed";

          return (
            <div key={s.num} className={`stepper-step ${stateClass}`} id={`step-indicator-${s.num}`}>
              <div className="step-bubble">{step > s.num ? "✓" : s.num}</div>
              <div className="step-label">{s.label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="wizard-card" id="questionnaire-form-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title" id="form-card-title">
          Community Activity & Meeting Questionnaire
        </h2>
        <p className="wizard-subtitle" id="form-card-subtitle">
          Possibilities Africa Internal Community Reporting and Planning System
        </p>
      </div>

      {renderStepper()}

      {/* STEP 0: INSTRUCTIONS PAGE */}
        {step === 0 && (
          <div className="instructions-page" id="questionnaire-instructions" style={{ animation: "modalFadeIn 0.35s ease" }}>
            <h3 className="section-subtitle" style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "var(--pa-navy)" }}>
              Welcome & Instructions
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.95rem", lineHeight: "1.5" }}>
              This reporting portal allows Shalom leaders to submit activity updates, project plans, and meeting minutes to Possibilities Africa. Please review the instructions below before you begin filling out the questionnaire:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", gap: "1rem", backgroundColor: "white", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "1.5rem", color: "var(--pa-blue)", lineHeight: "1", fontWeight: "bold" }}>①</div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.2rem" }}>Community Information</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Provide details about your local community name, catchment area, CMC, and the reporting leader's contact info.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", backgroundColor: "white", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "1.5rem", color: "var(--pa-blue)", lineHeight: "1", fontWeight: "bold" }}>②</div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.2rem" }}>Submission Type</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Select whether you are reporting details of a completed activity/event, planning a future activity, or documenting a meeting (planning or minutes).</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", backgroundColor: "white", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "1.5rem", color: "var(--pa-blue)", lineHeight: "1", fontWeight: "bold" }}>③</div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.2rem" }}>Detailed Fields</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Explain the activity scope, goals, outcomes, list participants, and specify resources utilized/needed along with their provider details.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", backgroundColor: "white", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "1.5rem", color: "var(--pa-blue)", lineHeight: "1", fontWeight: "bold" }}>④</div>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.2rem" }}>Review & Submit</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Preview and verify all entered answers. Ensure everything is correct before finally submitting the response.</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: "var(--pa-yellow-light)",
              border: "1px solid rgba(249, 198, 16, 0.3)",
              borderRadius: "var(--border-radius-md)",
              padding: "1rem",
              marginBottom: "2rem"
            }}>
              <h4 style={{ fontSize: "0.9rem", color: "var(--pa-navy)", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                💡 Key Guidelines & Tips
              </h4>
              <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "var(--text-main)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <li>Fields marked with a red asterisk (<span className="required-dot" style={{ display: "inline", position: "static", float: "none" }}>*</span>) are mandatory and must be filled.</li>
                <li>You can upload supporting documents (photos, agendas, worksheets). File size must be under <strong>1.5 MB</strong>.</li>
              </ul>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStep(1)}
                style={{ padding: "0.75rem 2rem", fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                id="btn-start-questionnaire"
              >
                Start Questionnaire ➔
              </button>
            </div>
          </div>
        )}

      {step >= 1 && (
        <form onSubmit={handleSubmit} noValidate id="questionnaire-wizard-form">
        {/* STEP 1: SECTION A */}
        {step === 1 && (
          <SectionA
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}

        {/* STEP 2: SECTION B */}
        {step === 2 && (
          <SectionB
            submissionType={formData.submissionType}
            onChange={(type) => updateFormData({ submissionType: type })}
            errors={errors}
          />
        )}

        {/* STEP 3: SECTION C OR SECTION D */}
        {step === 3 && formData.submissionType === "activity_event" && (
          <SectionC
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}

        {step === 3 && formData.submissionType === "meeting" && (
          <SectionD
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}

        {/* STEP 4: PREVIEW */}
        {step === 4 && <FormPreview formData={formData} />}

        {/* STEP 5: SUCCESS SCREEN */}
        {step === 5 && (
          <div className="success-screen" id="form-submission-success">
            <div className="success-icon" id="success-icon-symbol">✓</div>
            <h3 className="success-title">Questionnaire Submitted!</h3>
            <p className="success-desc">
              Your questionnaire response has been saved locally with reference ID:{" "}
              <strong style={{ color: "var(--pa-blue)" }}>{submittedId}</strong>. 
              You can access this submission under the "Admin's Page" tab.
            </p>
            <div className="success-buttons" style={{ justifyContent: "center" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleReset}
                id="btn-success-new"
              >
                Submit New Response
              </button>
            </div>
          </div>
        )}

        {/* FOOTER BUTTONS FOR NAVIGATING THE STEPS */}
        {step >= 1 && step <= 4 && (
          <>
            {step === 3 && formData.documents && formData.documents.length > 0 && (
              <div className="uploaded-files-list" style={{ marginTop: "1.5rem", width: "100%" }}>
                <span className="preview-label" style={{ fontSize: "0.75rem", display: "block", marginBottom: "0.5rem" }}>
                  Uploaded Documents:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {formData.documents.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: "var(--pa-blue-light)",
                        color: "var(--pa-navy)",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "50px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        border: "1px solid rgba(21, 89, 237, 0.2)",
                      }}
                    >
                      <span>📄 {file.name} ({Math.round(file.size / 1024)} KB)</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-error)",
                          cursor: "pointer",
                          fontWeight: "bold",
                          padding: 0,
                          fontSize: "1rem",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="btn-group" id="form-nav-buttons">
              {step > 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                  id="btn-nav-back"
                >
                  ← Back
                </button>
              ) : (
                <div /> // Placeholder to push Next button to right
              )}

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {step === 3 && (
                  <>
                    <label
                      htmlFor="document-upload"
                      className="btn btn-secondary"
                      style={{
                        cursor: "pointer",
                        margin: 0,
                        backgroundColor: "#ffffff",
                        borderColor: "var(--pa-blue)",
                        color: "var(--pa-blue)",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                      id="btn-nav-upload"
                    >
                      Upload Documents
                    </label>
                    <input
                      type="file"
                      id="document-upload"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                    />
                  </>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    id="btn-nav-next"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-success"
                    id="btn-nav-submit"
                  >
                    ✓ Submit Questionnaire
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        </form>
      )}
    </div>
  );
}
