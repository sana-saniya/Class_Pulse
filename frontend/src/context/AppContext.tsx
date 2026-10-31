import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Student, RiskThresholds, FacultyUser } from '../types';
import { api } from '../api';
import { useAuth } from './AuthContext';

// ── Offline fallback ──────────────────────────────────────────────────────────
const OFFLINE_STUDENTS: Student[] = [
  { id: '1', rollNo: '22G1A0501', name: 'Aravind Swamy', department: 'CSE', section: 'A', attendancePct: 62, scores: { mid1: 22, mid2: 12, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, phone: '+91 98765 43210', parentEmail: 'parent@classpulse.edu', parentPhone: '+91 98765 43210', homeDistrict: 'Nellore', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { id: '2', rollNo: '22G1A0502', name: 'Bhavana Reddy', department: 'CSE', section: 'A', attendancePct: 88, scores: { mid1: 26, mid2: 27, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, phone: '+91 98765 43211', homeDistrict: 'Chittoor', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { id: '3', rollNo: '22G1A0503', name: 'C. Harish Kumar', department: 'ECE', section: 'B', attendancePct: 71, scores: { mid1: 20, mid2: 11, assignmentsSubmitted: 3, totalAssignments: 5 }, backlogs: 2, phone: '+91 98765 43212', homeDistrict: 'Hosur', state: 'Tamil Nadu', parentLanguage: 'ta', interventions: [] },
];
const DEFAULT_THRESHOLDS: RiskThresholds = { attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 };

// ── Context type ──────────────────────────────────────────────────────────────
interface AppContextType {
  students: Student[];
  facultyList: FacultyUser[];
  thresholds: RiskThresholds;
  setThresholds: (t: RiskThresholds) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  addStudent: (data: Partial<Student> & { mid1?: number; mid2?: number; assignmentsSubmitted?: number; totalAssignments?: number }) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addIntervention: (studentId: string, data: { type: string; notes: string; status: string; actionTakenBy: string }) => Promise<void>;
  generateCohort: () => Promise<void>;
  allocateStudents: (allocations: { studentId: string; assignedFacultyId: string }[]) => Promise<void>;
  assignStudent: (studentId: string, assignedFacultyId: string | null) => Promise<void>;
  requestProfileUpdate: (studentId: string, data: { phone?: string; parentPhone?: string; reason?: string }) => Promise<void>;
  approveProfileUpdate: (studentId: string) => Promise<void>;
  rejectProfileUpdate: (studentId: string, rejectionReason?: string) => Promise<void>;
  cancelProfileUpdate: (studentId: string) => Promise<void>;
  isOffline: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [students, setStudents]               = useState<Student[]>([]);
  const [facultyList, setFacultyList]         = useState<FacultyUser[]>([]);
  const [thresholds, setThresholdsState]      = useState<RiskThresholds>(DEFAULT_THRESHOLDS);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isOffline, setIsOffline]             = useState(false);
  const [isLoading, setIsLoading]             = useState(true);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [studentsData, thresholdsData, facultyData] = await Promise.all([
        api.getStudents(),
        api.getThresholds(),
        api.getFacultyList().catch(() => []),
      ]);
      setStudents(studentsData);
      setThresholdsState(thresholdsData);
      setFacultyList(facultyData || []);
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

  const allocateStudents = useCallback(async (allocations: { studentId: string; assignedFacultyId: string }[]) => {
    if (!isOffline) {
      try {
        const res = await api.allocateStudents(allocations);
        if (res.students) {
          setStudents(res.students);
          return;
        }
      } catch (e) {
        console.warn('API allocate failed, falling back to local state:', e);
      }
    }
    const map = new Map(allocations.map((a) => [a.studentId, a.assignedFacultyId]));
    setStudents((prev) => prev.map((s) => map.has(s.id) ? { ...s, assignedFacultyId: map.get(s.id) } : s));
  }, [isOffline]);

  const assignStudent = useCallback(async (studentId: string, assignedFacultyId: string | null) => {
    if (!isOffline) {
      try {
        await api.assignStudent(studentId, assignedFacultyId);
      } catch (e) {
        console.warn('API assign failed, updating local state:', e);
      }
    }
    setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, assignedFacultyId: assignedFacultyId || undefined } : s));
  }, [isOffline]);

  const requestProfileUpdate = useCallback(async (studentId: string, data: { phone?: string; parentPhone?: string; reason?: string }) => {
    if (!isOffline) {
      try {
        const res = await api.requestProfileUpdate(studentId, data);
        if (res.student) {
          setStudents((prev) => prev.map((s) => s.id === studentId ? res.student : s));
          return;
        }
      } catch (err) {
        console.warn('API requestProfileUpdate failed:', err);
        throw err;
      }
    }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              pendingProfileUpdate: {
                phone: data.phone || s.phone || null,
                parentPhone: data.parentPhone || s.parentPhone || null,
                reason: data.reason || 'Contact update requested by student',
                requestedAt: new Date().toISOString(),
                status: 'Pending',
              },
            }
          : s
      )
    );
  }, [isOffline]);

  const approveProfileUpdate = useCallback(async (studentId: string) => {
    if (!isOffline) {
      try {
        const res = await api.approveProfileUpdate(studentId);
        if (res.student) {
          setStudents((prev) => prev.map((s) => s.id === studentId ? res.student : s));
          return;
        }
      } catch (err) {
        console.warn('API approveProfileUpdate failed:', err);
        throw err;
      }
    }
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId && s.pendingProfileUpdate) {
          return {
            ...s,
            phone: s.pendingProfileUpdate.phone || s.phone,
            parentPhone: s.pendingProfileUpdate.parentPhone || s.parentPhone,
            pendingProfileUpdate: null,
          };
        }
        return s;
      })
    );
  }, [isOffline]);

  const rejectProfileUpdate = useCallback(async (studentId: string, rejectionReason?: string) => {
    if (!isOffline) {
      try {
        const res = await api.rejectProfileUpdate(studentId, rejectionReason);
        if (res.student) {
          setStudents((prev) => prev.map((s) => s.id === studentId ? res.student : s));
          return;
        }
      } catch (err) {
        console.warn('API rejectProfileUpdate failed:', err);
        throw err;
      }
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, pendingProfileUpdate: null } : s))
    );
  }, [isOffline]);

  const cancelProfileUpdate = useCallback(async (studentId: string) => {
    if (!isOffline) {
      try {
        const res = await api.cancelProfileUpdate(studentId);
        if (res.student) {
          setStudents((prev) => prev.map((s) => s.id === studentId ? res.student : s));
          return;
        }
      } catch (err) {
        console.warn('API cancelProfileUpdate failed:', err);
        throw err;
      }
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, pendingProfileUpdate: null } : s))
    );
  }, [isOffline]);

  return (
    <AppContext.Provider value={{
      students, facultyList, thresholds, setThresholds,
      selectedStudentId, setSelectedStudentId,
      addStudent, deleteStudent,
      addIntervention, generateCohort,
      allocateStudents, assignStudent,
      requestProfileUpdate, approveProfileUpdate,
      rejectProfileUpdate, cancelProfileUpdate,
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
