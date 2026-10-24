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

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  section: string;
  attendancePct: number;
  scores: AssessmentScores;
  backlogs: number;
  parentEmail?: string | null;
  parentPhone?: string | null;
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
