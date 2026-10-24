import type { Student, RiskThresholds, Intervention } from '../types';

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
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  // Students
  getStudents: () => fetchJSON<Student[]>(`${BASE}/students`),

  generateCohort: () =>
    fetchJSON<{ message: string; count: number }>(`${BASE}/students/generate`, { method: 'POST' }),

  exportCSV: () => {
    const token = getToken();
    const link = document.createElement('a');
    // Pass token as query param for file downloads
    link.href = `${BASE}/students/export?token=${token ?? ''}`;
    link.download = 'classpulse-report.csv';
    link.click();
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
};
