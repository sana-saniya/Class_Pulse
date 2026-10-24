import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Role, Student, RiskThresholds } from '../types';
import { api } from '../api';

// ── Fallback offline mock data ─────────────────────────────────────────────────
const OFFLINE_STUDENTS: Student[] = [
  { id: '1', rollNo: '22G1A0501', name: 'Aravind Swamy',     department: 'CSE',  section: 'A', attendancePct: 62, scores: { mid1: 22, mid2: 12, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, interventions: [] },
  { id: '2', rollNo: '22G1A0502', name: 'Bhavana Reddy',     department: 'CSE',  section: 'A', attendancePct: 88, scores: { mid1: 26, mid2: 27, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
  { id: '3', rollNo: '22G1A0503', name: 'C. Harish Kumar',   department: 'ECE',  section: 'B', attendancePct: 71, scores: { mid1: 20, mid2: 11, assignmentsSubmitted: 3, totalAssignments: 5 }, backlogs: 2, interventions: [] },
  { id: '4', rollNo: '22G1A0504', name: 'Divya Sri Lakshmi', department: 'EEE',  section: 'A', attendancePct: 92, scores: { mid1: 28, mid2: 29, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
  { id: '5', rollNo: '22G1A0505', name: 'E. Karthik Reddy',  department: 'CSE',  section: 'B', attendancePct: 68, scores: { mid1: 18, mid2: 14, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 4, interventions: [] },
  { id: '6', rollNo: '22G1A0506', name: 'Farida Begum',      department: 'MECH', section: 'A', attendancePct: 79, scores: { mid1: 23, mid2: 20, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 1, interventions: [] },
  { id: '7', rollNo: '22G1A0507', name: 'G. Venkat Sai',     department: 'ECE',  section: 'A', attendancePct: 55, scores: { mid1: 15, mid2:  8, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 5, interventions: [] },
  { id: '8', rollNo: '22G1A0508', name: 'Himabindu Patel',   department: 'CSE',  section: 'A', attendancePct: 84, scores: { mid1: 25, mid2: 24, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
  { id: '9', rollNo: '22G1A0509', name: 'Ibrahim Shaik',     department: 'EEE',  section: 'B', attendancePct: 73, scores: { mid1: 19, mid2: 15, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 2, interventions: [] },
  { id: '10', rollNo: '22G1A0510', name: 'J. Sravani',        department: 'MECH', section: 'B', attendancePct: 91, scores: { mid1: 27, mid2: 28, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
  { id: '11', rollNo: '22G1A0511', name: 'K. Ravi Teja',      department: 'CSE',  section: 'B', attendancePct: 66, scores: { mid1: 21, mid2: 10, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, interventions: [] },
  { id: '12', rollNo: '22G1A0512', name: 'Lavanya Mothukuri', department: 'ECE',  section: 'B', attendancePct: 82, scores: { mid1: 24, mid2: 25, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 0, interventions: [] },
  { id: '13', rollNo: '22G1A0513', name: 'M. Dheeraj',        department: 'MECH', section: 'A', attendancePct: 58, scores: { mid1: 16, mid2:  9, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 4, interventions: [] },
  { id: '14', rollNo: '22G1A0514', name: 'Nandini V',         department: 'EEE',  section: 'A', attendancePct: 77, scores: { mid1: 22, mid2: 21, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 1, interventions: [] },
  { id: '15', rollNo: '22G1A0515', name: 'O. Prashanth Varma',department: 'CSE',  section: 'A', attendancePct: 95, scores: { mid1: 29, mid2: 30, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
];

const DEFAULT_THRESHOLDS: RiskThresholds = { attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 };

// ── Context type ───────────────────────────────────────────────────────────────
interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  students: Student[];
  thresholds: RiskThresholds;
  setThresholds: (t: RiskThresholds) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  addIntervention: (studentId: string, data: { type: string; notes: string; status: string; actionTakenBy: string }) => Promise<void>;
  generateCohort: () => Promise<void>;
  isOffline: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('faculty');
  const [students, setStudents] = useState<Student[]>([]);
  const [thresholds, setThresholdsState] = useState<RiskThresholds>(DEFAULT_THRESHOLDS);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsData, thresholdsData] = await Promise.all([
        api.getStudents(),
        api.getThresholds(),
      ]);
      setStudents(studentsData);
      setThresholdsState(thresholdsData);
      setIsOffline(false);
      if (studentsData.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentsData[0].id);
      }
    } catch {
      // Backend unavailable — fall back to offline mode
      setStudents(OFFLINE_STUDENTS);
      setThresholdsState(DEFAULT_THRESHOLDS);
      setIsOffline(true);
      if (!selectedStudentId) setSelectedStudentId('1');
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void loadData(); }, [loadData]);

  const setThresholds = useCallback(async (t: RiskThresholds) => {
    setThresholdsState(t);
    if (!isOffline) {
      try { await api.updateThresholds(t); } catch { /* ignore */ }
    }
  }, [isOffline]);

  const addIntervention = useCallback(async (
    studentId: string,
    data: { type: string; notes: string; status: string; actionTakenBy: string },
  ) => {
    if (!isOffline) {
      const intervention = await api.addIntervention({ studentId, ...data });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, interventions: [...s.interventions, intervention] }
            : s,
        ),
      );
    } else {
      const intervention = {
        id: `local-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ...data,
      } as Student['interventions'][0];
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? { ...s, interventions: [...s.interventions, intervention] }
            : s,
        ),
      );
    }
  }, [isOffline]);

  const generateCohort = useCallback(async () => {
    if (!isOffline) {
      await api.generateCohort();
      await loadData();
    }
  }, [isOffline, loadData]);

  return (
    <AppContext.Provider value={{
      role, setRole,
      students, thresholds, setThresholds,
      selectedStudentId, setSelectedStudentId,
      addIntervention, generateCohort,
      isOffline, isLoading,
      refresh: loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
