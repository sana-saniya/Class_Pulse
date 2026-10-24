import { useState } from 'react';
import { HeartHandshake, Calendar, AlertTriangle, CheckCircle, TrendingDown, Clock, ShieldCheck, Mail, Phone, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { assessRisk } from '../utils/riskEngine';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from 'recharts';

export default function ParentView() {
  const { students, thresholds } = useApp();
  const { user } = useAuth();

  // Find linked student either by user rollNo or parent email matching
  const [selectedRoll, setSelectedRoll] = useState<string>(user?.rollNo || '22G1A0501');

  const student = students.find((s) => s.rollNo === selectedRoll) ||
                  students.find((s) => s.parentEmail?.toLowerCase() === user?.email?.toLowerCase()) ||
                  students[0];

  if (!student) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-gray-900 rounded-2xl border border-white/5">
        <HeartHandshake className="w-12 h-12 text-brand-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white">Student Record Not Found</h3>
        <p className="text-xs text-gray-400 mt-1">Please ensure your ward's roll number is correctly linked.</p>
      </div>
    );
  }

  const risk = assessRisk(student, thresholds);
  const attendanceOk = student.attendancePct >= thresholds.attendanceMin;
  const backlogsOk = student.backlogs <= thresholds.backlogsMax;
  const midDrop = student.scores.mid1 > 0 ? ((student.scores.mid1 - student.scores.mid2) / student.scores.mid1) * 100 : 0;
  const midTrendOk = midDrop <= thresholds.scoreDropMax;

  // Mid-term score comparison data
  const scoreData = [
    { name: 'Mid-1 Exam', score: student.scores.mid1, max: 30 },
    { name: 'Mid-2 Exam', score: student.scores.mid2, max: 30 },
  ];

  // Attendance history progression
  const base = student.attendancePct;
  const attendanceProgress = [
    { month: 'Month 1', att: Math.min(100, Math.round(base + 10)) },
    { month: 'Month 2', att: Math.min(100, Math.round(base + 5)) },
    { month: 'Month 3', att: Math.min(100, Math.round(base)) },
    { month: 'Current', att: student.attendancePct },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Transparency Header */}
      <div className="bg-gradient-to-r from-brand-900/40 via-purple-900/30 to-gray-900 border border-brand-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  NEP 2020 Parent Transparency Window
                </span>
                <span className="text-xs text-gray-400">Continuous Evaluation Portal</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Child Academic Progress & Early Notice</h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Real-time visibility so parents are never surprised at semester-end exam results.
              </p>
            </div>
          </div>

          {/* Child selector if multiple children / demo selection */}
          <div className="bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs">
            <label className="block text-[10px] text-gray-400 mb-0.5 font-medium">Viewing Ward</label>
            <select
              value={student.rollNo}
              onChange={(e) => setSelectedRoll(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.rollNo} className="bg-gray-900 text-white">
                  {s.name} ({s.rollNo}) - {s.department}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ward Profile & Status Banner */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-base">
              {student.name[0]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{student.name}</h3>
              <p className="text-xs text-gray-400 font-mono">
                Roll No: <span className="text-gray-200">{student.rollNo}</span> · Dept: <span className="text-gray-200">{student.department} (Sec {student.section})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Current Standing:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              risk.level === 'On Track'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : risk.level === 'Medium Risk'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-red-500/15 text-red-400 border-red-500/30'
            }`}>
              {risk.level === 'On Track' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {risk.level}
            </span>
          </div>
        </div>

        {/* 4 Pillars Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div className="bg-gray-800/60 rounded-xl p-3.5">
            <p className="text-gray-400 text-xs mb-1">Class Attendance</p>
            <p className={`text-xl font-bold ${attendanceOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {student.attendancePct}%
            </p>
            <p className="text-[10px] text-gray-500 mt-1">Min. Required: {thresholds.attendanceMin}%</p>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-3.5">
            <p className="text-gray-400 text-xs mb-1">Mid-1 Exam</p>
            <p className="text-xl font-bold text-white">{student.scores.mid1} <span className="text-xs text-gray-500">/ 30</span></p>
            <p className="text-[10px] text-gray-500 mt-1">Internal Assessment</p>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-3.5">
            <p className="text-gray-400 text-xs mb-1">Mid-2 Exam</p>
            <p className={`text-xl font-bold ${midTrendOk ? 'text-white' : 'text-amber-400'}`}>
              {student.scores.mid2} <span className="text-xs text-gray-500">/ 30</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-1">
              {student.scores.mid2 < student.scores.mid1 ? `Drop: -${(student.scores.mid1 - student.scores.mid2)} marks` : 'Maintained score'}
            </p>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-3.5">
            <p className="text-gray-400 text-xs mb-1">Pending Backlogs</p>
            <p className={`text-xl font-bold ${backlogsOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {student.backlogs}
            </p>
            <p className="text-[10px] text-gray-500 mt-1">Tolerance threshold: {thresholds.backlogsMax}</p>
          </div>
        </div>
      </div>

      {/* Early Notice Card - No Surprise of Results */}
      {risk.reasons.length > 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Early Academic Support Notice for Parents</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Faculty have flagged areas needing attention before final university examinations so corrective actions can be taken early at home and college:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {risk.reasons.map((r, i) => (
              <div key={i} className="p-3 bg-gray-900/80 rounded-xl border border-amber-500/20 text-xs text-gray-200 flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-3">
          <Award className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-emerald-300">Satisfactory Progress</h4>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Your ward is performing well and meets all attendance and assessment milestones. No critical interventions pending.
            </p>
          </div>
        </div>
      )}

      {/* Visual Progress Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Attendance Progression Chart */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <h4 className="text-xs font-semibold text-white">Attendance Stability Over Time</h4>
            </div>
            <span className="text-[11px] text-gray-400">Target: ≥{thresholds.attendanceMin}%</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={attendanceProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis domain={[40, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="att" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Attendance %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mid-1 vs Mid-2 Exams Chart */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-brand-400" />
              <h4 className="text-xs font-semibold text-white">Internal Exam Comparison</h4>
            </div>
            <span className="text-[11px] text-gray-400">Out of 30 Marks</span>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis domain={[0, 30]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="score" fill="#818cf8" radius={[8, 8, 0, 0]} name="Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Faculty Interventions & Actions History */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            <h4 className="text-xs font-semibold text-white">Faculty Support & Guidance Log</h4>
          </div>
          <span className="text-[11px] text-gray-500">{student.interventions.length} actions logged</span>
        </div>

        {student.interventions.length > 0 ? (
          <div className="space-y-3">
            {student.interventions.map((iv) => (
              <div key={iv.id} className="bg-gray-800/70 border border-white/5 rounded-xl p-4 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white text-sm">{iv.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    iv.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400'
                    : iv.status === 'In Progress' ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-gray-700 text-gray-300'
                  }`}>
                    {iv.status}
                  </span>
                </div>
                <p className="text-gray-300">{iv.notes || 'Routine academic progress follow-up conducted by department faculty.'}</p>
                <div className="flex items-center justify-between text-gray-500 text-[11px] pt-1 border-t border-white/5">
                  <span>Conducted by: {iv.actionTakenBy}</span>
                  <span>Date: {iv.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs bg-gray-800/30 rounded-xl">
            No disciplinary or remedial interventions logged for this student.
          </div>
        )}
      </div>

      {/* College Contact Banner */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-brand-400 shrink-0" />
          <div>
            <p className="font-semibold text-white">Need to speak with faculty or department head?</p>
            <p className="text-gray-400 text-[11px]">Department counseling hours: Mon - Fri, 3:30 PM - 5:00 PM</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-300 text-[11px]">
          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-brand-400" /> hod@classpulse.edu</span>
          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-brand-400" /> +91 (08554) 272433</span>
        </div>
      </div>
    </div>
  );
}
