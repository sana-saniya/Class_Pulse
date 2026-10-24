import { useState } from 'react';
import { MessageSquarePlus, Users, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { assessRisk, getRiskColor } from '../utils/riskEngine';
import StudentTable from '../components/StudentTable';
import ThresholdControls from '../components/ThresholdControls';
import XAICard from '../components/XAICard';
import InterventionModal from '../components/InterventionModal';
import type { Student } from '../types';

export default function FacultyView() {
  const { students, thresholds, selectedStudentId, setSelectedStudentId } = useApp();
  const [modalStudent, setModalStudent] = useState<Student | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? students[0];

  const stats = {
    total: students.length,
    highRisk: students.filter((s) => assessRisk(s, thresholds).level === 'High Risk').length,
    medRisk: students.filter((s) => assessRisk(s, thresholds).level === 'Medium Risk').length,
    onTrack: students.filter((s) => assessRisk(s, thresholds).level === 'On Track').length,
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'indigo' },
          { label: 'High Risk', value: stats.highRisk, icon: TrendingDown, color: 'red' },
          { label: 'Medium Risk', value: stats.medRisk, icon: AlertTriangle, color: 'amber' },
          { label: 'On Track', value: stats.onTrack, icon: CheckCircle2, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <StudentTable onSelect={(s) => setSelectedStudentId(s.id)} />
        </div>

        <div className="space-y-4">
          <ThresholdControls />

          {selectedStudent && (
            <>
              {/* Student detail card */}
              <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{selectedStudent.name}</h3>
                    <p className="text-xs text-gray-500">{selectedStudent.rollNo} · {selectedStudent.department}-{selectedStudent.section}</p>
                  </div>
                  {(() => {
                    const risk = assessRisk(selectedStudent, thresholds);
                    const c = getRiskColor(risk.level);
                    return (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
                        {risk.level}
                      </span>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Attendance', value: `${selectedStudent.attendancePct}%` },
                    { label: 'Mid-1', value: `${selectedStudent.scores.mid1}/30` },
                    { label: 'Mid-2', value: `${selectedStudent.scores.mid2}/30` },
                    { label: 'Backlogs', value: selectedStudent.backlogs },
                    { label: 'Assignments', value: `${selectedStudent.scores.assignmentsSubmitted}/${selectedStudent.scores.totalAssignments}` },
                    { label: 'Interventions', value: selectedStudent.interventions.length },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-800 rounded-xl p-2.5">
                      <p className="text-gray-500 mb-0.5">{item.label}</p>
                      <p className="text-white font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setModalStudent(selectedStudent)}
                  className="mt-3 w-full py-2 bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/30 text-brand-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  Log Intervention
                </button>
              </div>

              <XAICard student={selectedStudent} />

              {/* Intervention history */}
              {selectedStudent.interventions.length > 0 && (
                <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-gray-400 mb-3">Intervention History</h4>
                  <div className="space-y-2">
                    {selectedStudent.interventions.map((iv) => (
                      <div key={iv.id} className="bg-gray-800 rounded-xl p-3 text-xs">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-white font-medium">{iv.type}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                            iv.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400'
                            : iv.status === 'In Progress' ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-gray-700 text-gray-400'
                          }`}>{iv.status}</span>
                        </div>
                        <p className="text-gray-400">{iv.notes}</p>
                        <p className="text-gray-600 mt-1">{iv.date} · {iv.actionTakenBy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modalStudent && (
        <InterventionModal student={modalStudent} onClose={() => setModalStudent(null)} />
      )}
    </div>
  );
}
