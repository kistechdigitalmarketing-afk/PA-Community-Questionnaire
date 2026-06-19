"use client";

import React, { useState } from "react";
import SectionA from "./SectionA";
import SectionB from "./SectionB";
import SectionC from "./SectionC";
import SectionD from "./SectionD";
import FormPreview from "./FormPreview";
import {
  FormData,
  INITIAL_FORM_STATE,
  SubmissionType,
  UploadedFile,
} from "../data/formData";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Form() {
  const [step, setStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedId, setSubmittedId] = useState<string>("");
  const [stepError, setStepError] = useState("");

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

  const updateFormData = (updates: Partial<FormData>) => {
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

    if (currentStep === 2) {
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
      if (!formData.contactInfo.trim()) newErrors.contactInfo = "Phone number is required";
    }

    if (currentStep === 3) {
      if (!formData.submissionType) {
        newErrors.submissionType = "Please select a submission type to proceed";
      } else if (formData.submissionType === "activity_event") {
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
      } else if (formData.submissionType === "meeting") {
        const meet = formData.meetingDetails;
        if (!meet.meetingSubtype) {
          newErrors["meetingDetails.meetingSubtype"] = "Please select a meeting action";
        }
        if (!meet.meetingTitle.trim()) {
          newErrors["meetingDetails.meetingTitle"] = "Meeting title is required";
        }

        if (meet.meetingSubtype === "planning") {
          if (!meet.dateAndTime.trim())newErrors["meetingDetails.dateAndTime"] = "Please enter the meeting date and time (e.g. 26-06-2026 1:30 PM)"
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

if (Object.keys(newErrors).length > 0) {
  setStepError(Object.values(newErrors)[0]);
  return false;
}

setStepError("");
return true;
  };

  const handleNext = () => {
  if (validateStep(step)) {
    setStep(step + 1);
    window.scrollTo(0, 0);
  }
};

  const handleBack = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const saveLocally = (data: FormData) => {
    try {
      const existing = localStorage.getItem("pa_forms") || localStorage.getItem("pa_questionnaires");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(data);
      localStorage.setItem("pa_forms", JSON.stringify(list));
    } catch (err) {
      console.error("Failed to save submission locally", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      return;
    }
    if (!validateStep(3)) return;

    // Generate unique ID and metadata
    const submissionId = "PAQ-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const finalData: FormData = {
      ...formData,
      id: submissionId,
      timestamp: Date.now(),
    };

    // Save to Firestore if configured, otherwise fallback to local storage
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "submissions"), {
          ...finalData,
          timestamp: Date.now() // Ensure fresh numeric timestamp for sort orders
        });
        setSubmittedId(submissionId);
        setStep(5); // Success state
      } catch (err) {
        console.error("Failed to save submission to Firestore", err);
        // Fallback to local storage in case of connection failure
        saveLocally(finalData);
        setSubmittedId(submissionId);
        setStep(5);
      }
    } else {
  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbwvsOW7DxWV3eQ0ALqJTqkpoU9s2J3bMEVKRmV1azI9QWLG2KUUzvlCbb4twRgRQEhccQ/exec",
      {
        method: "POST",
        body: JSON.stringify(finalData),
      }
    );

    setSubmittedId(submissionId);
    setStep(5);
  } catch (err) {
    console.error("Google Sheet save failed", err);

    saveLocally(finalData);
    setSubmittedId(submissionId);
    setStep(5);
  }
}
  };

  const handleReset = () => {
  setFormData(INITIAL_FORM_STATE);
  setErrors({});
  setStep(0);
};

const handleAutoNumbering = (
  value: string,
  setter: (value: string) => void,
  e: React.KeyboardEvent<HTMLTextAreaElement>
) => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  const lines = value
    .split("\n")
    .filter((line) => line.trim() !== "");

  const numberedLines = lines.map((line, index) =>
    /^\d+\./.test(line.trim())
      ? line
      : `${index + 1}. ${line}`
  );

  const nextNumber = numberedLines.length + 1;

  setter(
    [...numberedLines, `${nextNumber}. `].join("\n")
  );
};

// Stepper UI helper
const renderStepper = () => {
    if (step === 0 || step > 3) return null; // Hide stepper on instructions or success screen
    
    const stepsInfo = [
  { num: 2, label: "Community Info" },
  { num: 3, label: "Details" },
  { num: 4, label: "Preview" },
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
    <div className="wizard-card" id="form-wizard">

      {renderStepper()}

{/* STEP 0 - START SCREEN */}
{step === 0 && (
  <div style={{ textAlign: "center", padding: "2rem" }}>
    <div
      style={{
        background: "#fff8e6",
        border: "1px solid #f0c14b",
        borderRadius: "12px",
        padding: "1rem",
        marginBottom: "2rem",
        maxWidth: "700px",
        marginLeft: "auto",
        marginRight: "auto",
        textAlign: "left",
      }}
    >
      <h4>💡 Reporting Guidelines</h4>

      <ul style={{ paddingLeft: "1.5rem", lineHeight: 1.8 }}>
        <li>
          Fields marked with a red asterisk (*) are mandatory and must be
          filled.
        </li>
        <li>
          You can upload supporting documents (photos, agendas, worksheets).
          File size must be under 1.5 MB.
        </li>
      </ul>
    </div>

    <h3>What would you like to do today?</h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "500px",
        margin: "2rem auto",
      }}
    >
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          updateFormData({
            submissionType: "activity_event",
            activitySubtype: "reporting",
          });
          setStep(2);
        }}
      >
        Report on a Past Activity / Event
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          updateFormData({
            submissionType: "activity_event",
            activitySubtype: "planning",
          });
          setStep(2);
        }}
      >
        Plan a Future Activity / Event
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          updateFormData({
            submissionType: "meeting",
            meetingDetails: {
              ...formData.meetingDetails,
              meetingSubtype: "minutes",
            },
          });
          setStep(2);
        }}
      >
        Report on a Past Meeting (Minutes)
      </button>

      <button
        type="button"
        className="btn btn-primary"
        onClick={() => {
          updateFormData({
            submissionType: "meeting",
            meetingDetails: {
              ...formData.meetingDetails,
              meetingSubtype: "planning",
            },
          });
          setStep(2);
        }}
      >
        Plan / Schedule a Future Meeting
      </button>
    </div>
  </div>
)}

{/* FORM STEPS */}
{step >= 2 && step <= 4 && (
  <form onSubmit={handleSubmit} noValidate id="form-wizard-flow">

    {step === 2 && (
      <SectionA
        formData={formData}
        onChange={updateFormData}
        errors={errors}
      />
    )}

    {step === 3 && (
      <>
        {formData.submissionType === "activity_event" ? (
          <SectionC
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        ) : (
          <SectionD
            formData={formData}
            onChange={updateFormData}
            errors={errors}
          />
        )}
      </>
    )}

    {step === 4 && (
      <FormPreview formData={formData} />
    )}

        {/* FOOTER BUTTONS FOR NAVIGATING THE STEPS */}
        {step >= 1 && step <= 4 && (
          <>
            {step === 2 && formData.submissionType && formData.documents && formData.documents.length > 0 && (
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
             <div style={{ display: "flex", gap: "0.75rem" }}>

  {step === 2 && (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() => setStep(0)}
    >
      🏠 Home
    </button>
  )}

  {step > 2 && (
    <button
      key={step === 3 ? "btn-edit-again" : "btn-back"}
      type="button"
      className="btn btn-secondary"
      onClick={handleBack}
      id="btn-nav-back"
    >
      ← Back
    </button>
  )}

</div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {step === 3 && formData.submissionType && (
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
                    {/* Uploaded Documents Preview */}
{formData.documents && formData.documents.length > 0 && (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginLeft: "0.75rem",
      maxWidth: "500px",
    }}
  >
    {formData.documents.map((file, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 0.75rem",
          border: "1px solid #d1d5db",
          borderRadius: "999px",
          background: "#f8fafc",
          fontSize: "0.85rem",
        }}
      >
        <span>
  📄 {file.name} ({(file.size / 1024).toFixed(0)} KB)
</span>

        <button
          type="button"
          onClick={() => handleRemoveFile(index)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#dc2626",
            fontWeight: "bold",
            fontSize: "0.9rem",
          }}
          title="Remove file"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
)}
                  </>
                )}
                {stepError && (
  <div
    style={{
      color: "#dc2626",
      fontSize: "0.85rem",
      fontWeight: 600,
      marginBottom: "0.5rem",
      textAlign: "right",
    }}
  >
    ⚠ {stepError}
  </div>
)}

                {step < 4 ? (
                  <button
                    key="btn-next"
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNext}
                    id="btn-nav-next"
                  >
                    
                    Next →
                  </button>
                ) : (
                  <button
                    key="btn-submit"
                    type="submit"
                    className="btn btn-success"
                    id="btn-nav-submit"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </>
        )}
        </form>
)}

{/* SUCCESS SCREEN */}
{step === 5 && (
  <div
    className="success-screen"
    style={{
      textAlign: "center",
      padding: "3rem",
    }}
  >
    <div
      style={{
        fontSize: "4rem",
        color: "green",
        marginBottom: "1rem",
      }}
    >
      ✓
    </div>

    <h2>Form Submitted Successfully!</h2>

    <p style={{ marginTop: "1rem" }}>
      Thank you. Your submission has been received.
    </p>

    <p>
      Reference ID: <strong>{submittedId}</strong>
    </p>

    
<button
      type="button"
      className="btn btn-primary"
      onClick={handleReset}
      style={{ marginTop: "1.5rem" }}
    >
      Submit Another Response
    </button>
  </div>
)}
      
    </div>
  );
}
