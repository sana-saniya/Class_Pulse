export type Role = 'faculty' | 'hod' | 'student' | 'parent';
export type RiskLevel = 'High Risk' | 'Medium Risk' | 'On Track';

export interface AssessmentScores {
  mid1: number;
  mid2: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
}

export interface Intervention {
  id: string;
  date: string;
  type: '1-on-1 Counseling' | 'Parent Meeting' | 'Remedial Class' | 'Peer Tutoring';
  notes: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  actionTakenBy: string;
}

export interface ProfileUpdateDetails {
  phone?: string | null;
  parentPhone?: string | null;
  reason?: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy?: string | null;
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  section: string;
  attendancePct: number;
  scores: AssessmentScores;
  backlogs: number;
  phone?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
  homeDistrict?: string;
  state?: string;
  parentLanguage?: string; // default 'te'
  assignedFacultyId?: string;
  pendingProfileUpdate?: ProfileUpdateDetails | null;
  interventions: Intervention[];
}

export interface FacultyUser {
  _id: string;
  name: string;
  email: string;
  role: 'faculty';
  department: string;
  phone?: string | null;
  createdAt?: string;
}

export interface RiskThresholds {
  attendanceMin: number;
  scoreDropMax: number;
  backlogsMax: number;
}

export interface RiskAssessment {
  level: RiskLevel;
  reasons: string[];
  scoreDrop: number;
}
