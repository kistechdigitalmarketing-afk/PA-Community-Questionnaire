export interface Program {
  id: string;
  name: string;
  ppps: string[];
}

export const PA_PROGRAMS: Program[] = [
  {
    id: "tldp",
    name: "Transformational Leadership Development Program",
    ppps: ["Shalom Groups", "Leadership Development", "Networking"],
  },
  {
    id: "sdp",
    name: "Spiritual Discipleship Program",
    ppps: [
      "Pastors’ Biblical & Devotional Growth",
      "Church Spiritual Development",
      "Community Leaders’ Conferences",
    ],
  },
  {
    id: "epp",
    name: "Economic Productivity Program",
    ppps: [
      "Merry-Go-Round / Table Banking (TB)",
      "Income Generating Activities (IGAs)",
      "Community High Impact Projects (CHIPs)",
      "SACCO",
    ],
  },
  {
    id: "mng",
    name: "Mentoring the Next Generation",
    ppps: [
      "Church Children’s and Youth Activities",
      "Parenting Project",
      "Community Christian Schools / School Outreach",
    ],
  },
  {
    id: "rc",
    name: "Responsible Citizenship",
    ppps: [
      "CIFA Health Initiative",
      "Legal Education & Aid",
      "Community Civic Forums",
      "Disaster Preparedness",
      "Church–Community Collaboration",
    ],
  },
];

export const ACTIVITY_TYPES = [
  "Working",
  "Learning",
  "Resourcing",
  "Serving",
  "Reporting",
];

export const RESOURCE_TYPES = ["Facilitators", "Materials", "Funds", "Equipment"];

export const RESOURCE_PROVIDERS = [
  { id: "pa", label: "Possibilities Africa" },
  { id: "self", label: "Self Raised" },
  { id: "other", label: "Another Organization (Specify)" },
];

export type SubmissionType = "activity_event" | "meeting";

export type ActivitySubtype = "planning" | "reporting";

export type MeetingSubtype = "planning" | "minutes";

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  base64?: string;
}

export interface QuestionnaireData {
  id?: string;
  timestamp?: number;
  
  // Section A: Community Information
  countryName: string;
  catchmentArea: string;
  cmc: string;
  dateEstablished: string;
  communityName: string;
  shalomLeadersCount: string;
  leaderName: string;
  contactInfo: string;

  // Documents uploaded
  documents?: UploadedFile[];

  // Section B: Submission Type
  submissionType: SubmissionType | "";

  // Section C: Activity/Event Reporting or Planning
  activityTitle: string;
  activitySubtype: ActivitySubtype | "";
  programId: string;
  pppSelected: string;
  activityTypesSelected: string[];
  
  // IF REPORTING AN ACTIVITY
  reportingDetails: {
    whatWhyHow: string;
    outcomes: string;
    participants: string[];
    nextSteps: string;
    resourcesUtilized: {
      types: string[];
      providers: string[];
      providerSpecifyOther: string;
      description: string;
      descriptions?: Record<string, string>;
      providersMap?: Record<string, string[]>;
      providerSpecifyOthers?: Record<string, string>;
    };
  };

  // IF PLANNING AN ACTIVITY
  planningDetails: {
    whatWhyHow: string;
    expectedOutcomes: string;
    resourcesNeeded: {
      types: string[];
      acquisitionMethods: string[];
      acquisitionSpecifyOther: string;
      description: string;
      descriptions?: Record<string, string>;
      acquisitionMethodsMap?: Record<string, string[]>;
      acquisitionSpecifyOthers?: Record<string, string>;
    };
  };

  // Section D: Meeting Planning or Minutes
  meetingDetails: {
    meetingSubtype: MeetingSubtype | "";
    meetingTitle: string;
    // Planning
    dateAndTime: string;
    venue: string;
    planningAgenda: string;
    // Minutes
    minutesAgenda: string;
    keyTakeaways: string;
    followUpActions: string;
    attendance: string;
  };
  // Admin properties
  status?: "pending" | "review" | "completed";
  adminFeedback?: string;
}

export const INITIAL_QUESTIONNAIRE_STATE: QuestionnaireData = {
  countryName: "",
  catchmentArea: "",
  cmc: "",
  dateEstablished: "",
  communityName: "",
  shalomLeadersCount: "",
  leaderName: "",
  contactInfo: "",
  documents: [],
  submissionType: "",
  activityTitle: "",
  activitySubtype: "",
  programId: "",
  pppSelected: "",
  activityTypesSelected: [],
  reportingDetails: {
    whatWhyHow: "",
    outcomes: "",
    participants: [""],
    nextSteps: "",
    resourcesUtilized: {
      types: [],
      providers: [],
      providerSpecifyOther: "",
      description: "",
      descriptions: {},
      providersMap: {},
      providerSpecifyOthers: {},
    },
  },
  planningDetails: {
    whatWhyHow: "",
    expectedOutcomes: "",
    resourcesNeeded: {
      types: [],
      acquisitionMethods: [],
      acquisitionSpecifyOther: "",
      description: "",
      descriptions: {},
      acquisitionMethodsMap: {},
      acquisitionSpecifyOthers: {},
    },
  },
  meetingDetails: {
    meetingSubtype: "",
    meetingTitle: "",
    dateAndTime: "",
    venue: "",
    planningAgenda: "",
    minutesAgenda: "",
    keyTakeaways: "",
    followUpActions: "",
    attendance: "",
  },
  status: "pending",
  adminFeedback: "",
};
