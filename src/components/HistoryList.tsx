"use client";

import React, { useEffect, useState } from "react";
import { QuestionnaireData, PA_PROGRAMS, INITIAL_QUESTIONNAIRE_STATE } from "../data/questionnaireData";

export default function HistoryList() {
  const [submissions, setSubmissions] = useState<QuestionnaireData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<QuestionnaireData | null>(null);

  // Filters State
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCatchment, setFilterCatchment] = useState("");
  const [filterCommunity, setFilterCommunity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Admin Change State
  const [adminStatus, setAdminStatus] = useState<"pending" | "review" | "completed">("pending");
  const [adminFeedback, setAdminFeedback] = useState("");

  // Initialize admin change state when details modal opens
  useEffect(() => {
    if (selectedItem) {
      setAdminStatus(selectedItem.status || "pending");
      setAdminFeedback(selectedItem.adminFeedback || "");
    }
  }, [selectedItem]);

  const handleSaveAdminChanges = () => {
    if (!selectedItem) return;

    const updatedSubmissions = submissions.map((item) => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: adminStatus,
          adminFeedback: adminFeedback,
        };
      }
      return item;
    });

    localStorage.setItem("pa_questionnaires", JSON.stringify(updatedSubmissions));
    setSubmissions(updatedSubmissions);
    setSelectedItem({
      ...selectedItem,
      status: adminStatus,
      adminFeedback: adminFeedback,
    });
    alert("Admin changes saved successfully!");
  };

  const getStatusBadge = (status: string = "pending") => {
    let text = "Pending";
    let bg = "#fffaf0";
    let color = "#dd6b20";
    let border = "1px solid #fbd38d";

    if (status === "review") {
      text = "In Review";
      bg = "#ebf8ff";
      color = "#3182ce";
      border = "1px solid #90cdf4";
    } else if (status === "completed") {
      text = "Completed";
      bg = "#f0fff4";
      color = "#38a169";
      border = "1px solid #9ae6b4";
    }

    return (
      <span style={{
        backgroundColor: bg,
        color: color,
        border: border,
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase"
      }}>
        {text}
      </span>
    );
  };

  // Load submissions from localStorage
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = () => {
    const saved = localStorage.getItem("pa_questionnaires");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuestionnaireData[];
        // Auto initialize status and feedback for legacy records
        const sanitized = parsed.map(item => ({
          ...item,
          status: item.status || "pending",
          adminFeedback: item.adminFeedback || ""
        }));
        setSubmissions(sanitized);
      } catch (err) {
        console.error("Failed to parse submissions", err);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Delete an individual item
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (!confirm("Are you sure you want to delete this submission?")) return;

    const updated = submissions.filter((item) => item.id !== id);
    localStorage.setItem("pa_questionnaires", JSON.stringify(updated));
    setSubmissions(updated);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  // Download a single item as JSON
  const handleExportSingle = (item: QuestionnaireData, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PA-Questionnaire-${item.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download ALL items as JSON
  const handleExportAll = () => {
    if (submissions.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PA-All-Questionnaires-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Inject Demo Submissions for testing
  const handleInjectDemo = () => {
    const demoData: QuestionnaireData[] = [
      {
        id: "PAQ-TLD9802",
        timestamp: Date.now() - 3600000 * 24 * 2, // 2 days ago
        countryName: "Kenya",
        communityName: "Kapsabet Community",
        catchmentArea: "Nandi County",
        cmc: "Kapsabet CMC Chapter",
        dateEstablished: "2018-05-12",
        shalomLeadersCount: "8",
        leaderName: "Pastor Ezra Kiprotich",
        contactInfo: "ezra.kip@example.com, +254 712 345678",
        submissionType: "activity_event",
        activityTitle: "Transformational Leadership Training Seminar",
        activitySubtype: "reporting",
        programId: "tldp",
        pppSelected: "Leadership Development",
        activityTypesSelected: ["Learning", "Resourcing"],
        reportingDetails: {
          whatWhyHow: "We organized a two-day seminar for local pastors and shalom leaders to teach core principles of servant leadership. Facilitators focused on community engagement and conflict resolution models.",
          outcomes: "24 leaders successfully graduated. 5 new Shalom Groups were planned for kickoff in July. Leaders expressed renewed energy to address local family challenges.",
          participants: ["Pastor Ezra Kiprotich", "Jane Wanjiku", "David Ndwiga", "Mary Muthoni", "Grace Kerubo"],
          nextSteps: "Conduct home visits to follow up on the leadership commitments. Gather feedback for the second phase of training.",
          resourcesUtilized: {
            types: ["Facilitators", "Materials", "Funds"],
            providers: ["pa", "self"],
            providerSpecifyOther: "",
            description: "Possibilities Africa provided learning manuals and part-funded the venue hire ($200). Local members self-raised $80 to cover meals and refreshments.",
            descriptions: {
              "Facilitators": "Possibilities Africa provided leadership facilitators.",
              "Materials": "Possibilities Africa provided learning manuals.",
              "Funds": "Local members self-raised $80 to cover venue hire ($200) and meals/refreshments."
            },
            providersMap: {
              "Facilitators": ["pa"],
              "Materials": ["pa"],
              "Funds": ["self"]
            },
            providerSpecifyOthers: {
              "Facilitators": "",
              "Materials": "",
              "Funds": ""
            }
          },
        },
        documents: [
          {
            name: "Leadership_Training_Agenda.pdf",
            size: 104200,
            type: "application/pdf",
            base64: "data:text/plain;base64,RGVtbyBQREYgQ29udGVudCBmb3IgTGVhZGVyc2hpcCBUcmFpbmluZyBBZ2VuZGE="
          }
        ],
        planningDetails: INITIAL_QUESTIONNAIRE_STATE.planningDetails,
        meetingDetails: INITIAL_QUESTIONNAIRE_STATE.meetingDetails,
        status: "completed",
        adminFeedback: "Great work conducting this leadership training seminar! The graduations and planned kickoff for Shalom Groups are excellent outcomes.",
      },
      {
        id: "PAQ-MEE4311",
        timestamp: Date.now() - 3600000 * 4, // 4 hours ago
        countryName: "Kenya",
        communityName: "Molo Community",
        catchmentArea: "Nakuru County",
        cmc: "Molo Committee",
        dateEstablished: "2021-09-30",
        shalomLeadersCount: "12",
        leaderName: "Jane Wanjiku",
        contactInfo: "jane.wanjiku@example.com, +254 799 887766",
        submissionType: "meeting",
        activityTitle: "",
        activitySubtype: "",
        programId: "",
        pppSelected: "",
        activityTypesSelected: [],
        reportingDetails: INITIAL_QUESTIONNAIRE_STATE.reportingDetails,
        planningDetails: INITIAL_QUESTIONNAIRE_STATE.planningDetails,
        meetingDetails: {
          meetingSubtype: "minutes",
          meetingTitle: "Quarterly Table Banking Review Meeting",
          dateAndTime: "",
          venue: "",
          planningAgenda: "",
          minutesAgenda: "1. Review Table Banking balances.\n2. Discuss members facing loan repayments delays.\n3. Strategy for agricultural projects.",
          keyTakeaways: "Table Banking reserve stands at KES 45,000. Decided to extend the repayment window for farmers affected by delayed rainfall by 30 days.",
          followUpActions: "Jane Wanjiku to contact the extension officer for advisory on dry-season crop management. Next meeting scheduled for July 10.",
          attendance: "Jane Wanjiku, Pastor John, David Ndwiga, Mary Muthoni, Grace Kerubo (Absent with apology: Peter Kamau)",
        },
        status: "review",
        adminFeedback: "In review. Table Banking balances look healthy, but we need details on the Dry-Season crop management advisory follow-up.",
      },
      {
        id: "PAQ-ECN3091",
        timestamp: Date.now() - 3600000 * 24 * 10, // 10 days ago
        countryName: "Kenya",
        communityName: "Vihiga Community",
        catchmentArea: "Vihiga County",
        cmc: "Vihiga CMC",
        dateEstablished: "2020-02-15",
        shalomLeadersCount: "6",
        leaderName: "Deacon Samuel Mudavadi",
        contactInfo: "sam.muda@example.com",
        submissionType: "activity_event",
        activityTitle: "Poultry Project Launch",
        activitySubtype: "planning",
        programId: "epp",
        pppSelected: "Income Generating Activities (IGAs)",
        activityTypesSelected: ["Working", "Resourcing"],
        reportingDetails: INITIAL_QUESTIONNAIRE_STATE.reportingDetails,
        planningDetails: {
          whatWhyHow: "We intend to launch a collective poultry farming project for 15 families to establish sustainable egg selling businesses. Possibilities Africa will supply chicks, and we will build coop shelters locally.",
          expectedOutcomes: "Provide secondary income source to 15 households, yielding an expected KES 8,000 per family monthly within 6 months.",
          resourcesNeeded: {
            types: ["Materials", "Funds", "Equipment"],
            acquisitionMethods: ["pa", "self", "other"],
            acquisitionSpecifyOther: "County Ministry of Agriculture",
            description: "Chicks and vaccines ($300) from PA. Feed and lumber ($150) raised by members. County Ministry will provide free training booklets.",
            descriptions: {
              "Materials": "County Ministry will provide free training booklets.",
              "Funds": "Chicks and vaccines ($300) from PA. Feed and lumber ($150) raised by members.",
              "Equipment": "Feeding and watering troughs."
            },
            acquisitionMethodsMap: {
              "Materials": ["other"],
              "Funds": ["pa", "self"],
              "Equipment": ["self"]
            },
            acquisitionSpecifyOthers: {
              "Materials": "County Ministry of Agriculture",
              "Funds": "",
              "Equipment": ""
            }
          },
        },
        meetingDetails: INITIAL_QUESTIONNAIRE_STATE.meetingDetails,
        status: "pending",
        adminFeedback: "",
      },
    ];

    localStorage.setItem("pa_questionnaires", JSON.stringify(demoData));
    setSubmissions(demoData);
  };

  const getSubtypeLabel = (item: QuestionnaireData) => {
    if (item.submissionType === "activity_event") {
      return item.activitySubtype === "planning" ? "Activity (Planning)" : "Activity (Reporting)";
    } else {
      return item.meetingDetails.meetingSubtype === "planning" ? "Meeting (Planning)" : "Meeting (Minutes)";
    }
  };

  const getSubtypeBadgeColor = (item: QuestionnaireData) => {
    if (item.submissionType === "activity_event") {
      return item.activitySubtype === "planning" ? "var(--pa-blue)" : "var(--pa-orange)";
    } else {
      return item.meetingDetails.meetingSubtype === "planning" ? "#805ad5" : "#319795";
    }
  };

  // Get unique filter choices from submissions
  const countries = Array.from(new Set(submissions.map(item => item.countryName).filter(Boolean).sort()));
  const catchmentAreas = Array.from(new Set(submissions.map(item => item.catchmentArea).filter(Boolean).sort()));
  const communities = Array.from(new Set(submissions.map(item => item.communityName).filter(Boolean).sort()));

  // Filter list
  const filteredSubmissions = submissions.filter((item) => {
    const s = searchTerm.toLowerCase();
    const communityName = item.communityName?.toLowerCase() || "";
    const leaderName = item.leaderName?.toLowerCase() || "";
    const id = item.id?.toLowerCase() || "";
    const title =
      item.submissionType === "activity_event"
        ? item.activityTitle?.toLowerCase() || ""
        : item.meetingDetails?.meetingTitle?.toLowerCase() || "";

    const matchesSearch =
      communityName.includes(s) ||
      leaderName.includes(s) ||
      id.includes(s) ||
      title.includes(s);

    const matchesCountry = !filterCountry || item.countryName === filterCountry;
    const matchesCatchment = !filterCatchment || item.catchmentArea === filterCatchment;
    const matchesCommunity = !filterCommunity || item.communityName === filterCommunity;
    const matchesStatus = !filterStatus || (item.status || "pending") === filterStatus;

    return matchesSearch && matchesCountry && matchesCatchment && matchesCommunity && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCountry("");
    setFilterCatchment("");
    setFilterCommunity("");
    setFilterStatus("");
  };

  if (selectedItem) {
    const title =
      selectedItem.submissionType === "activity_event"
        ? selectedItem.activityTitle
        : selectedItem.meetingDetails.meetingTitle;

    const programInfo =
      selectedItem.submissionType === "activity_event"
        ? PA_PROGRAMS.find((p) => p.id === selectedItem.programId)?.name || ""
        : "";

    return (
      <div id="submission-detail-page" style={{ animation: "modalFadeIn 0.3s ease" }}>
        {/* Back navigation */}
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setSelectedItem(null)}
            className="btn btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            ← Back to Admin's Page
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            onClick={(e) => handleExportSingle(selectedItem, e)}
            title="Download JSON"
            id="btn-detail-export-json"
          >
            📥 Export JSON
          </button>
        </div>

        {/* Detailed Content styled like a premium page/card */}
        <div className="wizard-card" style={{ padding: "2rem", boxShadow: "var(--shadow-md)", marginTop: "1rem" }}>
          <div style={{
            borderBottom: "2.5px solid var(--pa-blue)",
            paddingBottom: "1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <span style={{
                backgroundColor: getSubtypeBadgeColor(selectedItem),
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "50px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: "0.5rem"
              }}>
                {getSubtypeLabel(selectedItem)}
              </span>
              <h2 style={{ fontSize: "1.6rem", color: "var(--pa-navy)", margin: 0 }}>
                {title || "Untitled"}
              </h2>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginTop: "0.25rem" }}>
                Submitted: {selectedItem.timestamp ? new Date(selectedItem.timestamp).toLocaleString() : "Unknown"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
              {getStatusBadge(selectedItem.status)}
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)" }}>
                Reference ID: {selectedItem.id}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Admin Comments and Status */}
            <div style={{
              padding: "1.25rem",
              backgroundColor: "#f7fafc",
              borderRadius: "var(--border-radius-md)",
              border: "1.5px solid var(--border-color)"
            }}>
              <h3 style={{ borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.4rem", color: "var(--pa-navy)", fontSize: "1.15rem", marginBottom: "1rem" }}>
                Admin Review & Feedback
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
                    Submission Status
                  </label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value as any)}
                    className="form-select"
                    style={{ padding: "0.6rem", fontSize: "0.9rem" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
                    Feedback / Comments
                  </label>
                  <textarea
                    value={adminFeedback}
                    onChange={(e) => setAdminFeedback(e.target.value)}
                    placeholder="Add administrative feedback or comments here..."
                    className="form-textarea"
                    style={{ minHeight: "100px", fontSize: "0.9rem", padding: "0.6rem" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAdminChanges}
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                  id="btn-detail-save-admin"
                >
                  💾 Save Admin Changes
                </button>
              </div>
            </div>

            {/* Community & Leader Information */}
            <div>
              <h3 style={{ borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.4rem", color: "var(--pa-navy)", fontSize: "1.15rem", marginBottom: "1rem" }}>
                Community & Leader Information
              </h3>
              <div className="preview-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                <div className="preview-item">
                  <span className="preview-label">Country Name</span>
                  <span className="preview-val">{selectedItem.countryName}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Catchment Area</span>
                  <span className="preview-val">{selectedItem.catchmentArea}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Community Name</span>
                  <span className="preview-val">{selectedItem.communityName}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">CMC</span>
                  <span className="preview-val">{selectedItem.cmc}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Date Established</span>
                  <span className="preview-val">{selectedItem.dateEstablished}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Number of Shalom Leaders</span>
                  <span className="preview-val">{selectedItem.shalomLeadersCount}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Leader Providing Information</span>
                  <span className="preview-val">{selectedItem.leaderName}</span>
                </div>
                <div className="preview-item" style={{ gridColumn: "span 2" }}>
                  <span className="preview-label">Contact Information</span>
                  <span className="preview-val">{selectedItem.contactInfo}</span>
                </div>
              </div>
            </div>

            {/* Submission-Specific Fields */}
            {selectedItem.submissionType === "activity_event" && (
              <div>
                <h3 style={{ borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.4rem", color: "var(--pa-navy)", fontSize: "1.15rem", marginBottom: "1rem" }}>
                  Activity / Event Details
                </h3>
                <div className="preview-grid" style={{ marginBottom: "1.5rem" }}>
                  <div className="preview-item">
                    <span className="preview-label">Program Name</span>
                    <span className="preview-val">{programInfo}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Program Pillar & Project (PPP)</span>
                    <span className="preview-val">{selectedItem.pppSelected}</span>
                  </div>
                  <div className="preview-item" style={{ gridColumn: "span 2" }}>
                    <span className="preview-label">Activity Type(s)</span>
                    <span className="preview-val">{selectedItem.activityTypesSelected.join(", ")}</span>
                  </div>
                </div>

                {selectedItem.activitySubtype === "reporting" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="preview-item">
                      <span className="preview-label">What was done, why, and how</span>
                      <div className="preview-textarea-val">{selectedItem.reportingDetails.whatWhyHow}</div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Outcomes (What was achieved)</span>
                      <div className="preview-textarea-val">{selectedItem.reportingDetails.outcomes}</div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Present Participants</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.25rem" }}>
                        {selectedItem.reportingDetails.participants && selectedItem.reportingDetails.participants.length > 0 ? (
                          selectedItem.reportingDetails.participants.map((p, idx) => (
                            <span key={idx} style={{
                              display: "inline-block",
                              backgroundColor: "#ebf8ff",
                              color: "#2b6cb0",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "12px",
                              fontSize: "0.8rem",
                              fontWeight: 500
                            }}>
                              👤 {p}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>None listed</span>
                        )}
                      </div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Next Steps / Follow-up</span>
                      <div className="preview-textarea-val">{selectedItem.reportingDetails.nextSteps}</div>
                    </div>

                    <div style={{ backgroundColor: "#f7fafc", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", marginTop: "0.5rem" }}>
                      <span className="preview-label" style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>Resources Utilized</span>
                      {selectedItem.reportingDetails.resourcesUtilized.providersMap &&
                      Object.keys(selectedItem.reportingDetails.resourcesUtilized.providersMap).length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {selectedItem.reportingDetails.resourcesUtilized.types.map((type) => {
                            const desc = selectedItem.reportingDetails.resourcesUtilized.descriptions?.[type] || "";
                            const providers = selectedItem.reportingDetails.resourcesUtilized.providersMap?.[type] || [];
                            const specifyOther = selectedItem.reportingDetails.resourcesUtilized.providerSpecifyOthers?.[type] || "";

                            return (
                              <div key={type} style={{
                                backgroundColor: "white",
                                padding: "1rem",
                                borderRadius: "var(--border-radius-md)",
                                border: "1px solid var(--border-color)"
                              }}>
                                <div style={{ fontWeight: "bold", color: "var(--pa-navy)", marginBottom: "0.5rem", fontSize: "0.9rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
                                  {type}
                                </div>
                                <div style={{ marginBottom: "0.5rem" }}>
                                  <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Explanation:</span>
                                  <div style={{ fontSize: "0.85rem", whiteSpace: "pre-line", color: "var(--text-main)" }}>
                                    {desc || "None provided"}
                                  </div>
                                </div>
                                <div>
                                  <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Provider(s):</span>
                                  <div style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 500 }}>
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
                        // Fallback to legacy display
                        <>
                          <div className="preview-grid" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <div>
                              <span className="preview-label" style={{ fontSize: "0.7rem" }}>Resource Types</span>
                              <span className="preview-val" style={{ fontSize: "0.85rem" }}>
                                {selectedItem.reportingDetails.resourcesUtilized.types.join(", ") || "None"}
                              </span>
                            </div>
                            <div>
                              <span className="preview-label" style={{ fontSize: "0.7rem" }}>Who Provided</span>
                              <span className="preview-val" style={{ fontSize: "0.85rem" }}>
                                {selectedItem.reportingDetails.resourcesUtilized.providers
                                  .map((p) => {
                                    if (p === "pa") return "Possibilities Africa";
                                    if (p === "self") return "Self Raised";
                                    if (p === "other")
                                      return `Another Organization (${selectedItem.reportingDetails.resourcesUtilized.providerSpecifyOther})`;
                                    return p;
                                  })
                                  .join(", ") || "None"}
                              </span>
                            </div>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label" style={{ fontSize: "0.7rem" }}>Explanation</span>
                            <div className="preview-textarea-val" style={{ backgroundColor: "white", fontSize: "0.85rem" }}>
                              {selectedItem.reportingDetails.resourcesUtilized.description || "None provided"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {selectedItem.activitySubtype === "planning" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="preview-item">
                      <span className="preview-label">What is planned, why, and how</span>
                      <div className="preview-textarea-val">{selectedItem.planningDetails.whatWhyHow}</div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Expected Outcomes</span>
                      <div className="preview-textarea-val">{selectedItem.planningDetails.expectedOutcomes}</div>
                    </div>

                    <div style={{ backgroundColor: "#f7fafc", padding: "1rem", borderRadius: "var(--border-radius-md)", border: "1px solid var(--border-color)", marginTop: "0.5rem" }}>
                      <span className="preview-label" style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>Resources Needed</span>
                      {selectedItem.planningDetails.resourcesNeeded.acquisitionMethodsMap &&
                      Object.keys(selectedItem.planningDetails.resourcesNeeded.acquisitionMethodsMap).length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          {selectedItem.planningDetails.resourcesNeeded.types.map((type) => {
                            const desc = selectedItem.planningDetails.resourcesNeeded.descriptions?.[type] || "";
                            const methods = selectedItem.planningDetails.resourcesNeeded.acquisitionMethodsMap?.[type] || [];
                            const specifyOther = selectedItem.planningDetails.resourcesNeeded.acquisitionSpecifyOthers?.[type] || "";

                            return (
                              <div key={type} style={{
                                backgroundColor: "white",
                                padding: "1rem",
                                borderRadius: "var(--border-radius-md)",
                                border: "1px solid var(--border-color)"
                              }}>
                                <div style={{ fontWeight: "bold", color: "var(--pa-navy)", marginBottom: "0.5rem", fontSize: "0.9rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.25rem" }}>
                                  {type}
                                </div>
                                <div style={{ marginBottom: "0.5rem" }}>
                                  <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Explanation:</span>
                                  <div style={{ fontSize: "0.85rem", whiteSpace: "pre-line", color: "var(--text-main)" }}>
                                    {desc || "None provided"}
                                  </div>
                                </div>
                                <div>
                                  <span className="preview-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginBottom: "0.15rem" }}>Acquisition Method(s):</span>
                                  <div style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 500 }}>
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
                        // Fallback to legacy display
                        <>
                          <div className="preview-grid" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <div>
                              <span className="preview-label" style={{ fontSize: "0.7rem" }}>Resource Types</span>
                              <span className="preview-val" style={{ fontSize: "0.85rem" }}>
                                {selectedItem.planningDetails.resourcesNeeded.types.join(", ") || "None"}
                              </span>
                            </div>
                            <div>
                              <span className="preview-label" style={{ fontSize: "0.7rem" }}>Acquisition Method</span>
                              <span className="preview-val" style={{ fontSize: "0.85rem" }}>
                                {selectedItem.planningDetails.resourcesNeeded.acquisitionMethods
                                  .map((m) => {
                                    if (m === "pa") return "Possibilities Africa";
                                    if (m === "self") return "Self Raised";
                                    if (m === "other")
                                      return `Another Organization (${selectedItem.planningDetails.resourcesNeeded.acquisitionSpecifyOther})`;
                                    return m;
                                  })
                                  .join(", ") || "None"}
                              </span>
                            </div>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label" style={{ fontSize: "0.7rem" }}>Explanation</span>
                            <div className="preview-textarea-val" style={{ backgroundColor: "white", fontSize: "0.85rem" }}>
                              {selectedItem.planningDetails.resourcesNeeded.description || "None provided"}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedItem.submissionType === "meeting" && (
              <div>
                <h3 style={{ borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.4rem", color: "var(--pa-navy)", fontSize: "1.15rem", marginBottom: "1rem" }}>
                  Meeting Details
                </h3>

                {selectedItem.meetingDetails.meetingSubtype === "planning" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="preview-grid" style={{ gap: "1rem" }}>
                      <div className="preview-item">
                        <span className="preview-label">Date & Time</span>
                        <span className="preview-val">
                          {new Date(selectedItem.meetingDetails.dateAndTime).toLocaleString() || ""}
                        </span>
                      </div>
                      <div className="preview-item">
                        <span className="preview-label">Venue</span>
                        <span className="preview-val">{selectedItem.meetingDetails.venue}</span>
                      </div>
                    </div>
                    <div className="preview-item" style={{ marginTop: "0.5rem" }}>
                      <span className="preview-label">Agenda (Planned topics for discussion)</span>
                      <div className="preview-textarea-val">{selectedItem.meetingDetails.planningAgenda}</div>
                    </div>
                  </div>
                )}

                {selectedItem.meetingDetails.meetingSubtype === "minutes" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="preview-item">
                      <span className="preview-label">Agenda (Topics discussed)</span>
                      <div className="preview-textarea-val">{selectedItem.meetingDetails.minutesAgenda}</div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Key Takeaways (Decisions achieved)</span>
                      <div className="preview-textarea-val">{selectedItem.meetingDetails.keyTakeaways}</div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Follow-up Actions</span>
                      <div className="preview-textarea-val">{selectedItem.meetingDetails.followUpActions}</div>
                    </div>
                    <div className="preview-item">
                      <span className="preview-label">Attendance</span>
                      <div className="preview-textarea-val">{selectedItem.meetingDetails.attendance}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attached Documents */}
            {selectedItem.documents && selectedItem.documents.length > 0 && (
              <div>
                <h3 style={{ borderBottom: "1.5px solid var(--border-color)", paddingBottom: "0.4rem", color: "var(--pa-navy)", fontSize: "1.15rem", marginBottom: "1rem" }}>
                  Attached Documents
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedItem.documents.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.6rem 0.8rem",
                        backgroundColor: "#f7fafc",
                        borderRadius: "var(--border-radius-md)",
                        border: "1px solid var(--border-color)"
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>📄 {file.name} ({Math.round(file.size / 1024)} KB)</span>
                      <a
                        href={file.base64}
                        download={file.name}
                        className="btn btn-secondary"
                        style={{
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.8rem",
                          textDecoration: "none",
                          borderColor: "var(--pa-blue)",
                          color: "var(--pa-blue)"
                        }}
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="submissions-history-view">
      <div className="history-header-bar">
        <h2 style={{ fontSize: "1.5rem", color: "var(--pa-navy)" }}>Questionnaire Submission Log</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {submissions.length > 0 && (
            <button className="btn btn-secondary" onClick={handleExportAll} id="btn-export-all">
              📥 Export All (JSON)
            </button>
          )}
          {submissions.length === 0 && (
            <button className="btn btn-primary" onClick={handleInjectDemo} id="btn-inject-demo">
              ⚡ Load Demo Submissions
            </button>
          )}
        </div>
      </div>

      {/* Search Input and Filters */}
      {submissions.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Search by community, leader, ref ID, or title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input"
              style={{ padding: "0.85rem 1.25rem", borderRadius: "100px", border: "1.5px solid var(--border-color)", backgroundColor: "#ffffff" }}
              id="history-search-input"
            />
          </div>

          {/* Dynamic Filters Panel */}
          <div className="filter-controls-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            backgroundColor: "#f7fafc",
            padding: "1rem 1.25rem",
            borderRadius: "var(--border-radius-md)",
            border: "1px solid var(--border-color)"
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
                Country
              </label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="form-select"
                style={{ padding: "0.5rem", fontSize: "0.85rem" }}
              >
                <option value="">All Countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
                Catchment Area
              </label>
              <select
                value={filterCatchment}
                onChange={(e) => setFilterCatchment(e.target.value)}
                className="form-select"
                style={{ padding: "0.5rem", fontSize: "0.85rem" }}
              >
                <option value="">All Catchment Areas</option>
                {catchmentAreas.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
                Community
              </label>
              <select
                value={filterCommunity}
                onChange={(e) => setFilterCommunity(e.target.value)}
                className="form-select"
                style={{ padding: "0.5rem", fontSize: "0.85rem" }}
              >
                <option value="">All Communities</option>
                {communities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem", display: "block" }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
                style={{ padding: "0.5rem", fontSize: "0.85rem" }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {(searchTerm || filterCountry || filterCatchment || filterCommunity || filterStatus) && (
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary"
                  style={{ padding: "0.3rem 0.75rem", fontSize: "0.75rem" }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="empty-state" id="history-empty-state">
          <div className="empty-state-icon">📋</div>
          <h4>No submissions found</h4>
          <p className="success-desc" style={{ fontSize: "0.9rem" }}>
            {submissions.length === 0
              ? "You haven't submitted any questionnaires yet on this device. Create one or load our demo data above."
              : "No search results match your criteria. Try adjusting your search term."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }} id="submissions-list-container">
          {filteredSubmissions.map((item) => {
            const title =
              item.submissionType === "activity_event"
                ? item.activityTitle
                : item.meetingDetails.meetingTitle;
            
            const programInfo =
              item.submissionType === "activity_event"
                ? PA_PROGRAMS.find((p) => p.id === item.programId)?.name || ""
                : "";

            return (
              <div
                key={item.id}
                className="history-card"
                onClick={() => setSelectedItem(item)}
                style={{ cursor: "pointer" }}
                id={`submission-card-${item.id}`}
              >
                <div className="history-card-header">
                  <div className="history-title-group">
                    <span
                      style={{
                        backgroundColor: getSubtypeBadgeColor(item),
                        color: "white",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "50px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        width: "fit-content",
                        marginBottom: "0.3rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {getSubtypeLabel(item)}
                    </span>
                    <h4 className="history-title">{title}</h4>
                    <span className="history-date">
                      Submitted: {item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {getStatusBadge(item.status)}
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      Ref: {item.id}
                    </span>
                  </div>
                </div>
                <div className="history-card-body">
                  <div className="history-meta-info">
                    <div className="history-meta-item">
                      <span className="history-meta-label">Community</span>
                      <span className="history-meta-value">{item.communityName}</span>
                    </div>
                    <div className="history-meta-item">
                      <span className="history-meta-label">Providing Leader</span>
                      <span className="history-meta-value">{item.leaderName}</span>
                    </div>
                    {programInfo && (
                      <div className="history-meta-item" style={{ maxWidth: "250px" }}>
                        <span className="history-meta-label">Program</span>
                        <span className="history-meta-value" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {programInfo}
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                      onClick={(e) => handleExportSingle(item, e)}
                      title="Download JSON"
                      id={`btn-export-single-${item.id}`}
                    >
                      📥 JSON
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", color: "var(--color-error)", borderColor: "rgba(229,62,62,0.2)" }}
                      onClick={(e) => handleDelete(item.id || "", e)}
                      title="Delete Record"
                      id={`btn-delete-${item.id}`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
