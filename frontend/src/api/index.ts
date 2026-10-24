import type { Student, RiskThresholds, Intervention } from '../types';

const BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  // Students
  getStudents: () => fetchJSON<Student[]>(`${BASE}/students`),

  generateCohort: () =>
    fetchJSON<{ message: string; count: number }>(`${BASE}/students/generate`, {
      method: 'POST',
    }),

  exportCSV: () => {
    const link = document.createElement('a');
    link.href = `${BASE}/students/export`;
    link.download = 'classpulse-report.csv';
    link.click();
  },

  // Thresholds
  getThresholds: () => fetchJSON<RiskThresholds>(`${BASE}/thresholds`),

  updateThresholds: (thresholds: Partial<RiskThresholds>) =>
    fetchJSON<RiskThresholds>(`${BASE}/thresholds`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};
