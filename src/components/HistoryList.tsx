"use client";

import React, { useEffect, useState } from "react";
import { FormData, PA_PROGRAMS, INITIAL_FORM_STATE } from "../data/formData";
import { db, isFirebaseConfigured } from "../lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  getDocs 
} from "firebase/firestore";

const convertToCSV = (items: FormData[]) => {
  const headers = [
    "Reference ID",
    "Date Submitted",
    "Status",
    "Country",
    "Catchment Area",
    "Community Name",
    "CMC",
    "Shalom Leaders Count",
    "Leader Name",
    "Phone Number",
    "Submission Type",
    "Subtype",
    "Title",
    "Program",
    "PPP",
    "Activity Types",
    "What/Why/How",
    "Outcomes/Agenda",
    "Next Steps/Takeaways",
    "Resources Utilized/Needed"
  ];

  const rows = items.map((item) => {
    const title = item.submissionType === "activity_event"
      ? item.activityTitle
      : item.meetingDetails.meetingTitle;

    const programName = item.submissionType === "activity_event"
      ? PA_PROGRAMS.find((p) => p.id === item.programId)?.name || ""
      : "";

    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : "";
    const subtype = item.submissionType === "activity_event"
      ? item.activitySubtype
      : item.meetingDetails.meetingSubtype;

    let whatWhyHow = "";
    let outcomes = "";
    let nextSteps = "";
    let resources = "";

    if (item.submissionType === "activity_event") {
      if (item.activitySubtype === "reporting") {
        whatWhyHow = item.reportingDetails.whatWhyHow;
        outcomes = item.reportingDetails.outcomes;
        nextSteps = item.reportingDetails.nextSteps;
        resources = item.reportingDetails.resourcesUtilized.types.join(", ");
      } else if (item.activitySubtype === "planning") {
        whatWhyHow = item.planningDetails.whatWhyHow;
        outcomes = item.planningDetails.expectedOutcomes;
        resources = item.planningDetails.resourcesNeeded.types.join(", ");
      }
    } else {
      if (item.meetingDetails.meetingSubtype === "planning") {
        outcomes = item.meetingDetails.planningAgenda;
      } else if (item.meetingDetails.meetingSubtype === "minutes") {
        whatWhyHow = item.meetingDetails.minutesAgenda;
        outcomes = item.meetingDetails.keyTakeaways;
        nextSteps = item.meetingDetails.followUpActions;
      }
    }

    return [
      item.id || "",
      dateStr,
      item.status || "pending",
      item.countryName || "",
      item.catchmentArea || "",
      item.communityName || "",
      item.cmc || "",
      item.shalomLeadersCount || "",
      item.leaderName || "",
      item.contactInfo || "",
      item.submissionType || "",
      subtype || "",
      title || "",
      programName,
      item.pppSelected || "",
      item.activityTypesSelected?.join(", ") || "",
      whatWhyHow,
      outcomes,
      nextSteps,
      resources
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
  ].join("\r\n");

  return csvContent;
};

const generatePrintHTML = (item: FormData) => {
  const title = item.submissionType === "activity_event"
    ? item.activityTitle
    : item.meetingDetails.meetingTitle;

  const programName = item.submissionType === "activity_event"
    ? PA_PROGRAMS.find((p) => p.id === item.programId)?.name || ""
    : "";

  const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : "Unknown";

  const subtypeLabel = item.submissionType === "activity_event"
    ? (item.activitySubtype === "planning" ? "Activity (Planning)" : "Activity (Reporting)")
    : (item.meetingDetails.meetingSubtype === "planning" ? "Meeting (Planning)" : "Meeting (Minutes)");

  let sectionDetailsHTML = "";
  if (item.submissionType === "activity_event") {
    let resourcesHTML = "";
    if (item.activitySubtype === "reporting") {
      const rowsHTML = item.reportingDetails.resourcesUtilized.types.map((type) => {
        const desc = item.reportingDetails.resourcesUtilized.descriptions?.[type] || "";
        const providers = item.reportingDetails.resourcesUtilized.providersMap?.[type] || [];
        const specifyOther = item.reportingDetails.resourcesUtilized.providerSpecifyOthers?.[type] || "";
        const provText = providers.map(p => {
          if (p === "pa") return "Possibilities Africa";
          if (p === "self") return "Self Raised";
          if (p === "other") return "Other (" + specifyOther + ")";
          return p;
        }).join(", ");
        return "<tr><td><strong>" + type + "</strong></td><td>" + desc + "</td><td>" + (provText || "None selected") + "</td></tr>";
      }).join("");

      resourcesHTML = `
        <div class="detail-section">
          <div class="section-title">Resources Utilized</div>
          <table class="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Explanation</th>
                <th>Provider(s)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      `;
    } else {
      const rowsHTML = item.planningDetails.resourcesNeeded.types.map((type) => {
        const desc = item.planningDetails.resourcesNeeded.descriptions?.[type] || "";
        const methods = item.planningDetails.resourcesNeeded.acquisitionMethodsMap?.[type] || [];
        const specifyOther = item.planningDetails.resourcesNeeded.acquisitionSpecifyOthers?.[type] || "";
        const methodText = methods.map(m => {
          if (m === "pa") return "Possibilities Africa";
          if (m === "self") return "Self Raised";
          if (m === "other") return "Other (" + specifyOther + ")";
          return m;
        }).join(", ");
        return "<tr><td><strong>" + type + "</strong></td><td>" + desc + "</td><td>" + (methodText || "None selected") + "</td></tr>";
      }).join("");

      resourcesHTML = `
        <div class="detail-section">
          <div class="section-title">Resources Needed</div>
          <table class="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Explanation</th>
                <th>Acquisition Method(s)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      `;
    }

    sectionDetailsHTML = `
      <div class="card">
        <div class="card-header" style="background-color: #0f172a; color: white;">Sections B & C: Activity / Event Details</div>
        <div class="card-body">
          <div class="grid-2">
            <div><strong>Activity Title:</strong> ${item.activityTitle || "N/A"}</div>
            <div><strong>Subtype:</strong> ${subtypeLabel}</div>
            <div><strong>Program Name:</strong> ${programName || "N/A"}</div>
            <div><strong>Program Pillar & Project (PPP):</strong> ${item.pppSelected || "N/A"}</div>
            <div style="grid-column: span 2;"><strong>Activity Type(s):</strong> ${item.activityTypesSelected?.join(", ") || "None"}</div>
          </div>
          ${item.activitySubtype === "reporting" ? `
            <div class="detail-section">
              <div class="section-title">What was done, why, and how</div>
              <div class="textarea-val">${item.reportingDetails.whatWhyHow}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Outcomes (What was achieved)</div>
              <div class="textarea-val">${item.reportingDetails.outcomes}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Present Participants</div>
              <div>${item.reportingDetails.participants?.join(", ") || "None listed"}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Next Steps & Follow-up Actions</div>
              <div class="textarea-val">${item.reportingDetails.nextSteps}</div>
            </div>
            ${resourcesHTML}
          ` : `
            <div class="detail-section">
              <div class="section-title">What is planned, why, and how</div>
              <div class="textarea-val">${item.planningDetails.whatWhyHow}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Expected Outcomes</div>
              <div class="textarea-val">${item.planningDetails.expectedOutcomes}</div>
            </div>
            ${resourcesHTML}
          `}
        </div>
      </div>
    `;
  } else {
    sectionDetailsHTML = `
      <div class="card">
        <div class="card-header" style="background-color: #0f172a; color: white;">Sections B & D: Meeting Details</div>
        <div class="card-body">
          <div class="grid-2">
            <div><strong>Meeting Title:</strong> ${item.meetingDetails.meetingTitle || "N/A"}</div>
            <div><strong>Subtype:</strong> ${subtypeLabel}</div>
          </div>
          ${item.meetingDetails.meetingSubtype === "planning" ? `
            <div class="grid-2" style="margin-top: 1rem;">
              <div><strong>Scheduled Date & Time:</strong> ${item.meetingDetails.dateAndTime ? new Date(item.meetingDetails.dateAndTime).toLocaleString() : "N/A"}</div>
              <div><strong>Venue:</strong> ${item.meetingDetails.venue || "N/A"}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Meeting Agenda (To be discussed)</div>
              <div class="textarea-val">${item.meetingDetails.planningAgenda}</div>
            </div>
          ` : `
            <div class="detail-section">
              <div class="section-title">Meeting Agenda (What was discussed)</div>
              <div class="textarea-val">${item.meetingDetails.minutesAgenda}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Key Takeaways (What was achieved/decided)</div>
              <div class="textarea-val">${item.meetingDetails.keyTakeaways}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Follow-up Actions</div>
              <div class="textarea-val">${item.meetingDetails.followUpActions}</div>
            </div>
            <div class="detail-section">
              <div class="section-title">Attendance</div>
              <div class="textarea-val">${item.meetingDetails.attendance}</div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  let feedbackHTML = "";
  if (item.adminFeedback) {
    feedbackHTML = `
      <div class="card" style="margin-top: 25px; border-color: #e2e8f0;">
        <div class="card-header" style="background-color: #3182ce; color: white;">Possibilities Africa Review & Feedback</div>
        <div class="card-body">
          <div><strong>Status:</strong> ${item.status ? item.status.toUpperCase() : "PENDING"}</div>
          <div style="margin-top: 10px;">
            <strong>Reviewer Comments:</strong>
            <div class="textarea-val" style="background-color: #ebf8ff; border-color: #bee3f8; margin-top: 5px;">${item.adminFeedback}</div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Possibilities Africa Report - ${item.id}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #2d3748;
          line-height: 1.6;
          margin: 0;
          padding: 30px;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #1559ed;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header img {
          height: 60px;
        }
        .header-title {
          text-align: right;
        }
        .header-title h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #0f172a;
        }
        .header-title p {
          margin: 5px 0 0 0;
          font-size: 0.85rem;
          color: #718096;
        }
        .meta-summary {
          display: flex;
          justify-content: space-between;
          background-color: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 15px 20px;
          margin-bottom: 30px;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
        }
        .meta-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #718096;
        }
        .meta-val {
          font-size: 0.95rem;
          font-weight: bold;
          color: #1a202c;
        }
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 25px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .card-header {
          background-color: #0f172a;
          color: #ffffff;
          padding: 12px 20px;
          font-weight: bold;
          font-size: 1rem;
          border-radius: 5px 5px 0 0;
        }
        .card-body {
          padding: 20px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .detail-section {
          margin-top: 20px;
          border-top: 1px solid #edf2f7;
          padding-top: 15px;
        }
        .section-title {
          font-size: 0.85rem;
          font-weight: bold;
          text-transform: uppercase;
          color: #718096;
          margin-bottom: 8px;
        }
        .textarea-val {
          background-color: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 4px;
          padding: 12px;
          font-size: 0.9rem;
          white-space: pre-wrap;
          color: #2d3748;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .table th, .table td {
          border: 1px solid #edf2f7;
          padding: 10px;
          text-align: left;
          font-size: 0.85rem;
        }
        .table th {
          background-color: #f7fafc;
          font-weight: bold;
        }
        @media print {
          body {
            padding: 0;
          }
          button, .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://africa.possibilitiesafrica.org/wp-content/uploads/2021/08/2020-PA-Logo_Color.png" alt="PA Logo">
        <div class="header-title">
          <h1>Community Activity & Meeting Form</h1>
          <p>Possibilities Africa Internal Community Reporting and Planning System</p>
        </div>
      </div>

      <div class="meta-summary">
        <div class="meta-item">
          <span class="meta-label">Reference ID</span>
          <span class="meta-val">${item.id}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Date Submitted</span>
          <span class="meta-val">${dateStr}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Status</span>
          <span class="meta-val" style="color: ${item.status === "completed" ? "#38a169" : item.status === "review" ? "#3182ce" : "#dd6b20"}">${item.status ? item.status.toUpperCase() : "PENDING"}</span>
        </div>
      </div>

      <!-- Section A -->
      <div class="card">
        <div class="card-header" style="background-color: #f6ad55; color: #1a202c;">Section A: Community Information</div>
        <div class="card-body">
          <div class="grid-2">
            <div><strong>Country Name:</strong> ${item.countryName || "N/A"}</div>
            <div><strong>Catchment Area:</strong> ${item.catchmentArea || "N/A"}</div>
            <div><strong>Community Name:</strong> ${item.communityName || "N/A"}</div>
            <div><strong>CMC:</strong> ${item.cmc || "N/A"}</div>
            <div><strong>Date Established:</strong> ${item.dateEstablished || "N/A"}</div>
            <div><strong>Number of Shalom Leaders:</strong> ${item.shalomLeadersCount || "N/A"}</div>
            <div><strong>Leader Providing Info:</strong> ${item.leaderName || "N/A"}</div>
            <div><strong>Phone Number:</strong> ${item.contactInfo || "N/A"}</div>
          </div>
        </div>
      </div>

      <!-- Section Details -->
      ${sectionDetailsHTML}

      <!-- Admin Comments -->
      ${feedbackHTML}

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;
};

const generatePrintHTMLAll = (items: FormData[]) => {
  const tableRowsHTML = items.map(item => {
    const title = item.submissionType === "activity_event"
      ? item.activityTitle
      : item.meetingDetails.meetingTitle;

    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : "Unknown";

    const subtypeLabel = item.submissionType === "activity_event"
      ? (item.activitySubtype === "planning" ? "Activity (Planning)" : "Activity (Reporting)")
      : (item.meetingDetails.meetingSubtype === "planning" ? "Meeting (Planning)" : "Meeting (Minutes)");

    const statusStyle = item.status === "completed"
      ? "background-color: #f0fff4; color: #38a169;"
      : item.status === "review"
        ? "background-color: #ebf8ff; color: #3182ce;"
        : "background-color: #fffaf0; color: #dd6b20;";

    return `
      <tr>
        <td><strong>${item.id}</strong></td>
        <td>${dateStr}</td>
        <td>${item.communityName}</td>
        <td>${item.leaderName}</td>
        <td>${item.countryName}</td>
        <td>${subtypeLabel}</td>
        <td>${title || "Untitled"}</td>
        <td><span class="badge" style="${statusStyle}">${item.status || "PENDING"}</span></td>
      </tr>
    `;
  }).join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Possibilities Africa - All Submissions Report</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #2d3748;
          line-height: 1.4;
          padding: 30px;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #1559ed;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header img {
          height: 50px;
        }
        .header-title h1 {
          margin: 0;
          font-size: 1.4rem;
          color: #0f172a;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .table th, .table td {
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          text-align: left;
          font-size: 0.8rem;
        }
        .table th {
          background-color: #f7fafc;
          font-weight: bold;
          text-transform: uppercase;
          color: #4a5568;
        }
        .badge {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://africa.possibilitiesafrica.org/wp-content/uploads/2021/08/2020-PA-Logo_Color.png" alt="PA Logo">
        <div class="header-title">
          <h1>Admin's View</h1>
          <p>Possibilities Africa Community Form Submissions Report - Generated ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Reference ID</th>
            <th>Date Submitted</th>
            <th>Community</th>
            <th>Leader</th>
            <th>Country</th>
            <th>Type</th>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHTML}
        </tbody>
      </table>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;
};

interface HistoryListProps {
  onLogout?: () => void;
}

export default function HistoryList({ onLogout }: HistoryListProps = {}) {
  const [submissions, setSubmissions] = useState<FormData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<FormData | null>(null);

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


const handleSaveAdminChanges = async () => {
  console.log("db =", db);
  console.log("isFirebaseConfigured =", isFirebaseConfigured);
  if (!selectedItem) return;

  try {
    let targetDocId = (selectedItem as any).docId;

    if (!targetDocId) {
      const q = query(
        collection(db, "submissions"),
        where("id", "==", selectedItem.id)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        targetDocId = snapshot.docs[0].id;
      }
    }

    if (!targetDocId) {
      throw new Error("Document ID not found");
    }

    await updateDoc(
      doc(db, "submissions", targetDocId),
      {
        status: adminStatus,
        adminFeedback: adminFeedback,
      }
    );

    const updatedSubmissions = submissions.map((item) =>
      item.id === selectedItem.id
        ? {
            ...item,
            status: adminStatus,
            adminFeedback: adminFeedback,
          }
        : item
    );

    setSubmissions(updatedSubmissions);

    setSelectedItem({
      ...selectedItem,
      status: adminStatus,
      adminFeedback: adminFeedback,
    });

    alert("Admin changes saved successfully!");
  } catch (error: any) {
  console.error("Failed to save admin changes:", error);

  alert(
    "Failed to save admin changes:\n\n" +
    (error?.message || JSON.stringify(error))
  );
}
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

  // Load submissions from Firestore (real-time) or localStorage fallback
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "submissions"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedSubmissions: FormData[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetchedSubmissions.push({
              ...data,
              docId: docSnap.id,
              status: data.status || "pending",
              adminFeedback: data.adminFeedback || ""
            } as any);
          });
          setSubmissions(fetchedSubmissions);
        }, (error) => {
          console.error("Firestore onSnapshot error, falling back to local storage:", error);
          loadSubmissions();
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Failed to setup Firestore listener", err);
        loadSubmissions();
      }
    } else {
      loadSubmissions();
    }
  }, []);

  const loadSubmissions = () => {
    const saved = localStorage.getItem("pa_forms") || localStorage.getItem("pa_questionnaires");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FormData[];
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
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    if (!confirm("Are you sure you want to delete this submission?")) return;

    const itemToDelete = submissions.find((item) => item.id === id);

    if (isFirebaseConfigured && db && itemToDelete) {
      try {
        let targetDocId = (itemToDelete as any).docId;
        if (!targetDocId) {
          const q = query(collection(db, "submissions"), where("id", "==", id));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            targetDocId = snapshot.docs[0].id;
          }
        }

        if (targetDocId) {
          await deleteDoc(doc(db, "submissions", targetDocId));
          alert("Submission deleted from database successfully!");
        } else {
          throw new Error("Firestore document ID not found");
        }
      } catch (err) {
        console.error("Failed to delete from Firestore", err);
        alert("Failed to delete from database. Deleting locally fallback...");
        deleteLocally(id);
      }
    } else {
      deleteLocally(id);
    }

    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const deleteLocally = (id: string) => {
    const updated = submissions.filter((item) => item.id !== id);
    localStorage.setItem("pa_forms", JSON.stringify(updated));
    setSubmissions(updated);
  };

  // Download a single item as JSON
  const handleExportSingle = (item: FormData, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PA-Form-${item.id}.json`);
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
    downloadAnchor.setAttribute("download", `PA-All-Forms-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSVAll = () => {
    if (submissions.length === 0) return;
    const csvContent = convertToCSV(submissions);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `PA-All-Forms-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCSVSingle = (item: FormData, e: React.MouseEvent) => {
    e.stopPropagation();
    const csvContent = convertToCSV([item]);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `PA-Form-${item.id}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPDFSingle = (item: FormData, e: React.MouseEvent) => {
    e.stopPropagation();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatePrintHTML(item));
      printWindow.document.close();
    } else {
      alert("Failed to open print window. Please allow popups for this site.");
    }
  };

  const handleExportPDFAll = () => {
    if (submissions.length === 0) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatePrintHTMLAll(submissions));
      printWindow.document.close();
    } else {
      alert("Failed to open print window. Please allow popups for this site.");
    }
  };

  // Inject Demo Submissions for testing
  const handleInjectDemo = () => {
    const demoData: FormData[] = [
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
        planningDetails: INITIAL_FORM_STATE.planningDetails,
        meetingDetails: INITIAL_FORM_STATE.meetingDetails,
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
        reportingDetails: INITIAL_FORM_STATE.reportingDetails,
        planningDetails: INITIAL_FORM_STATE.planningDetails,
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
        reportingDetails: INITIAL_FORM_STATE.reportingDetails,
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
        meetingDetails: INITIAL_FORM_STATE.meetingDetails,
        status: "pending",
        adminFeedback: "",
      },
    ];

    localStorage.setItem("pa_forms", JSON.stringify(demoData));
    setSubmissions(demoData);
  };

  const getSubtypeLabel = (item: FormData) => {
    if (item.submissionType === "activity_event") {
      return item.activitySubtype === "planning" ? "Activity (Planning)" : "Activity (Reporting)";
    } else {
      return item.meetingDetails.meetingSubtype === "planning" ? "Meeting (Planning)" : "Meeting (Minutes)";
    }
  };

  const getSubtypeBadgeColor = (item: FormData) => {
    if (item.submissionType === "activity_event") {
      return item.activitySubtype === "planning" ? "var(--pa-blue)" : "var(--pa-orange)";
    } else {
      return item.meetingDetails.meetingSubtype === "planning" ? "#805ad5" : "#319795";
    }
  };

  // Get unique filter choices from submissions
  const countries = Array.from(
  new Set(
    submissions
      .map(item =>
        item.countryName?.trim().toLowerCase()
      )
      .filter(Boolean)
  )
)
  .map(
    country =>
      country.charAt(0).toUpperCase() +
      country.slice(1)
  )
  .sort();

const catchmentAreas = Array.from(
  new Set(
    submissions
      .filter(
        item =>
          !filterCountry ||
          item.countryName?.trim().toLowerCase() ===
          filterCountry.trim().toLowerCase()
      )
      .map(item => item.catchmentArea?.trim())
      .filter(Boolean)
  )
).sort();

const communities = Array.from(
  new Set(
    submissions
      .filter(
        item =>
          (!filterCountry ||
            item.countryName?.trim().toLowerCase() ===
              filterCountry.trim().toLowerCase()) &&
          (!filterCatchment ||
            item.catchmentArea?.trim().toLowerCase() ===
              filterCatchment.trim().toLowerCase())
      )
      .map(item => item.communityName?.trim())
      .filter(Boolean)
  )
).sort();

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

    const matchesCountry =
  !filterCountry ||
  (item.countryName || "").trim().toLowerCase() ===
  filterCountry.trim().toLowerCase();

const matchesCatchment =
  !filterCatchment ||
  (item.catchmentArea || "").trim().toLowerCase() ===
  filterCatchment.trim().toLowerCase();

const matchesCommunity =
  !filterCommunity ||
  (item.communityName || "").trim().toLowerCase() ===
  filterCommunity.trim().toLowerCase();
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
  const countryStats = submissions.reduce((acc, item) => {
  const country =
    (item.countryName || "Unknown")
      .trim()
      .toLowerCase();

  if (!acc[country]) {
    acc[country] = 0;
  }

  acc[country]++;

  return acc;
}, {} as Record<string, number>);
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
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              onClick={(e) => handleExportCSVSingle(selectedItem, e)}
              title="Download Excel / CSV"
              id="btn-detail-export-csv"
            >
              📊 Export Excel
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              onClick={(e) => handleExportPDFSingle(selectedItem, e)}
              title="Print / Save PDF"
              id="btn-detail-export-pdf"
            >
              📄 Export PDF
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
                  <span className="preview-label">Phone Number</span>
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

          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="submissions-history-view">
      <div className="history-header-bar">
        <h2 style={{ fontSize: "1.5rem", color: "var(--pa-navy)" }}>Admin's View</h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {submissions.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={handleExportCSVAll} id="btn-export-all-csv">
                📊 Export All (Excel)
              </button>
              <button className="btn btn-secondary" onClick={handleExportPDFAll} id="btn-export-all-pdf">
                📄 Export All (PDF)
              </button>
              <button className="btn btn-secondary" onClick={handleExportAll} id="btn-export-all">
                📥 Export All (JSON)
              </button>
            </>
          )}
          {submissions.length === 0 && (
            <button className="btn btn-primary" onClick={handleInjectDemo} id="btn-inject-demo">
              ⚡ Load Demo Submissions
            </button>
          )}
          {onLogout && (
            <button 
              className="btn btn-secondary" 
              onClick={onLogout} 
              id="btn-logout"
              style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
            >
              🚪 Sign Out
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
                onChange={(e) => {
  setFilterCountry(e.target.value);
  setFilterCatchment("");
  setFilterCommunity("");
}}
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
                onChange={(e) => {
  setFilterCatchment(e.target.value);
  setFilterCommunity("");
}}
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
          {/* Country Statistics */}
<div
  style={{
    marginTop: "1rem",
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f7fafc",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-md)"
  }}
>
  <h3
    style={{
      marginBottom: "1rem",
      color: "var(--pa-navy)",
      fontSize: "1rem"
    }}
  >
    📊 Submission Count by Country
    <div
  style={{
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "var(--pa-navy)"
  }}
>
  Total Countries: {Object.keys(countryStats).length}
  {" • "}
  Total Submissions: {submissions.length}
</div>
  </h3>

 <div
  style={{
    maxHeight: "250px",
    overflowY: "auto",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    backgroundColor: "#fff"
  }}
>
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse"
    }}
  >
    <thead>
      <tr
        style={{
          backgroundColor: "#f7fafc",
          borderBottom: "1px solid var(--border-color)"
        }}
      >
        <th
          style={{
            textAlign: "left",
            padding: "0.75rem"
          }}
        >
          Country
        </th>

        <th
  style={{
    textAlign: "center",
    width: "140px",
    padding: "0.75rem"
  }}
>
          Submissions
        </th>
      </tr>
    </thead>

    <tbody>
      {Object.entries(countryStats)
  .sort((a, b) => b[1] - a[1])
  .map(([country, count]) => (
        <tr
          key={country}
          style={{
            borderBottom: "1px solid #eee"
          }}
        >
          <td
            style={{
              padding: "0.75rem"
            }}
          >
            {country}
          </td>

          <td
            style={{
              padding: "0.75rem",
              textAlign: "center",
              fontWeight: 700,
              color: "var(--pa-blue)"
            }}
          >
            {count}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
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
              ? "You haven't submitted any forms yet on this device. Create one or load our demo data above."
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
    <span className="history-meta-label">Country</span>
    <span className="history-meta-value">
      {item.countryName || "-"}
    </span>
  </div>

  <div className="history-meta-item">
    <span className="history-meta-label">Catchment Area</span>
    <span className="history-meta-value">
      {item.catchmentArea || "-"}
    </span>
  </div>

  <div className="history-meta-item">
    <span className="history-meta-label">Community</span>
    <span className="history-meta-value">
      {item.communityName || "-"}
    </span>
  </div>

  <div className="history-meta-item">
    <span className="history-meta-label">Providing Leader</span>
    <span className="history-meta-value">
      {item.leaderName || "-"}
    </span>
  </div>

  {programInfo && (
    <div
      className="history-meta-item"
      style={{ maxWidth: "250px" }}
    >
      <span className="history-meta-label">Program</span>
      <span
        className="history-meta-value"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {programInfo}
      </span>
    </div>
  )}

</div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                      onClick={(e) => handleExportCSVSingle(item, e)}
                      title="Download CSV (Excel)"
                      id={`btn-export-single-csv-${item.id}`}
                    >
                      📊 Excel
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                      onClick={(e) => handleExportPDFSingle(item, e)}
                      title="Print / Save PDF"
                      id={`btn-export-single-pdf-${item.id}`}
                    >
                      📄 PDF
                    </button>
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
