import type { Student, RiskThresholds, Intervention, FacultyUser } from '../types';

const BASE = '/api';
const TOKEN_KEY = 'classpulse_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  // Token expired / unauthorized — clear session
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
    throw new Error('Session expired');
  }

  if (!res.ok) {
    let msg = `API error ${res.status}`;
    try {
      const errObj = await res.json();
      msg = errObj.error || msg;
    } catch {
      msg = await res.text() || msg;
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Students
  getStudents: () => fetchJSON<Student[]>(`${BASE}/students`),

  addStudent: (data: Partial<Student> & { mid1?: number; mid2?: number; assignmentsSubmitted?: number; totalAssignments?: number }) =>
    fetchJSON<Student>(`${BASE}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteStudent: (id: string) =>
    fetchJSON<{ message: string; id: string }>(`${BASE}/students/${id}`, {
      method: 'DELETE',
    }),

  generateCohort: () =>
    fetchJSON<{ message: string; count: number }>(`${BASE}/students/generate`, { method: 'POST' }),

  exportCSV: async () => {
    const token = getToken();
    const res = await fetch(`${BASE}/students/export`, {
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'classpulse-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  },

  // Thresholds
  getThresholds: () => fetchJSON<RiskThresholds>(`${BASE}/thresholds`),

  updateThresholds: (thresholds: Partial<RiskThresholds>) =>
    fetchJSON<RiskThresholds>(`${BASE}/thresholds`, {
      method: 'PUT',
      body: JSON.stringify(thresholds),
    }),

  // Interventions
  getInterventions: () => fetchJSON<Intervention[]>(`${BASE}/interventions`),

  addIntervention: (data: {
    studentId: string;
    type: string;
    notes: string;
    status: string;
    actionTakenBy: string;
  }) =>
    fetchJSON<Intervention>(`${BASE}/interventions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Faculty Management for HOD
  getFacultyList: () => fetchJSON<FacultyUser[]>(`${BASE}/auth/faculty`),

  addFaculty: (data: { name: string; email: string; password: string; department?: string; phone?: string }) =>
    fetchJSON<FacultyUser>(`${BASE}/auth/faculty`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteFaculty: (id: string) =>
    fetchJSON<{ message: string; id: string }>(`${BASE}/auth/faculty/${id}`, {
      method: 'DELETE',
    }),
};
