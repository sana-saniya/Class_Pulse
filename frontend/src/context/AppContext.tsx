import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Student, RiskThresholds } from '../types';
import { api } from '../api';
import { useAuth } from './AuthContext';

// ── Offline fallback ──────────────────────────────────────────────────────────
const OFFLINE_STUDENTS: Student[] = [
  { id: '1', rollNo: '22G1A0501', name: 'Aravind Swamy', department: 'CSE', section: 'A', attendancePct: 62, scores: { mid1: 22, mid2: 12, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, parentEmail: 'parent@classpulse.edu', parentPhone: '+91 98765 43210', interventions: [] },
  { id: '2', rollNo: '22G1A0502', name: 'Bhavana Reddy', department: 'CSE', section: 'A', attendancePct: 88, scores: { mid1: 26, mid2: 27, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
  { id: '3', rollNo: '22G1A0503', name: 'C. Harish Kumar', department: 'ECE', section: 'B', attendancePct: 71, scores: { mid1: 20, mid2: 11, assignmentsSubmitted: 3, totalAssignments: 5 }, backlogs: 2, interventions: [] },
];
const DEFAULT_THRESHOLDS: RiskThresholds = { attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 };

// ── Context type ──────────────────────────────────────────────────────────────
interface AppContextType {
  students: Student[];
  thresholds: RiskThresholds;
  setThresholds: (t: RiskThresholds) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  addStudent: (data: Partial<Student> & { mid1?: number; mid2?: number; assignmentsSubmitted?: number; totalAssignments?: number }) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addIntervention: (studentId: string, data: { type: string; notes: string; status: string; actionTakenBy: string }) => Promise<void>;
  generateCohort: () => Promise<void>;
  isOffline: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [students, setStudents]               = useState<Student[]>([]);
  const [thresholds, setThresholdsState]      = useState<RiskThresholds>(DEFAULT_THRESHOLDS);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isOffline, setIsOffline]             = useState(false);
  const [isLoading, setIsLoading]             = useState(true);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
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
      setStudents(OFFLINE_STUDENTS);
      setThresholdsState(DEFAULT_THRESHOLDS);
      setIsOffline(true);
      if (!selectedStudentId) setSelectedStudentId('1');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void loadData(); }, [loadData]);

  const setThresholds = useCallback(async (t: RiskThresholds) => {
    setThresholdsState(t);
    if (!isOffline) {
      try { await api.updateThresholds(t); } catch { /* ignore */ }
    }
  }, [isOffline]);

  const addStudent = useCallback(async (
    data: Partial<Student> & { mid1?: number; mid2?: number; assignmentsSubmitted?: number; totalAssignments?: number }
  ) => {
    const created = await api.addStudent(data);
    setStudents((prev) => [created, ...prev]);
    setSelectedStudentId(created.id);
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    await api.deleteStudent(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setSelectedStudentId((prev) => (prev === id ? null : prev));
  }, []);

  const addIntervention = useCallback(async (
    studentId: string,
    data: { type: string; notes: string; status: string; actionTakenBy: string },
  ) => {
    if (!isOffline) {
      const intervention = await api.addIntervention({ studentId, ...data });
      setStudents((prev) =>
        prev.map((s) => s.id === studentId ? { ...s, interventions: [...s.interventions, intervention] } : s),
      );
    } else {
      const intervention = {
        id: `local-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        ...data,
      } as Student['interventions'][0];
      setStudents((prev) =>
        prev.map((s) => s.id === studentId ? { ...s, interventions: [...s.interventions, intervention] } : s),
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
      students, thresholds, setThresholds,
      selectedStudentId, setSelectedStudentId,
      addStudent, deleteStudent,
      addIntervention, generateCohort,
      isOffline, isLoading, refresh: loadData,
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
