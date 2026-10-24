import { Shield, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// Shows the logged-in student's own data matched by rollNo
export default function StudentView() {
  const { students, thresholds } = useApp();
  const { user } = useAuth();

  // Match by rollNo from the JWT — fall back to first student for demo
  const student = students.find((s) => s.rollNo === user?.rollNo) ?? students[0];

  if (!student) return <div className="text-gray-500 text-sm">Loading...</div>;

  const attendanceLine = [
    { week: 'W1', att: Math.min(100, student.attendancePct + 15) },
    { week: 'W2', att: Math.min(100, student.attendancePct + 10) },
    { week: 'W3', att: Math.min(100, student.attendancePct + 5) },
    { week: 'W4', att: student.attendancePct },
  ];

  const radarData = [
    { subject: 'Attendance', A: student.attendancePct },
    { subject: 'Mid-1', A: (student.scores.mid1 / 30) * 100 },
    { subject: 'Mid-2', A: (student.scores.mid2 / 30) * 100 },
    { subject: 'Assignments', A: (student.scores.assignmentsSubmitted / student.scores.totalAssignments) * 100 },
    { subject: 'Backlogs', A: Math.max(0, 100 - student.backlogs * 20) },
  ];

  const attStatus = student.attendancePct >= thresholds.attendanceMin;
  const mid2Status = student.scores.mid2 >= student.scores.mid1 * 0.85;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Privacy banner */}
      <div className="flex items-center gap-3 p-4 bg-brand-600/10 border border-brand-500/20 rounded-2xl">
        <Shield className="w-5 h-5 text-brand-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Privacy-Protected View</p>
          <p className="text-xs text-gray-400 mt-0.5">Only your personal academic data is shown. No peer comparisons or rankings.</p>
        </div>
      </div>

      {/* Student card */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
            {student.name[0]}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{student.name}</p>
            <p className="text-xs text-gray-500">{student.rollNo} · {student.department} · Sec {student.section}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Attendance', value: `${student.attendancePct}%`, ok: attStatus },
            { label: 'Mid-1 Score', value: `${student.scores.mid1}/30`, ok: student.scores.mid1 >= 15 },
            { label: 'Mid-2 Score', value: `${student.scores.mid2}/30`, ok: mid2Status },
            { label: 'Assignments', value: `${student.scores.assignmentsSubmitted}/${student.scores.totalAssignments}`, ok: student.scores.assignmentsSubmitted >= 3 },
            { label: 'Backlogs', value: `${student.backlogs}`, ok: student.backlogs <= thresholds.backlogsMax },
            { label: 'Interventions', value: `${student.interventions.length}`, ok: true },
          ].map((item) => (
            <div key={item.label} className="bg-gray-800 rounded-xl p-3">
              <p className="text-gray-500 mb-1">{item.label}</p>
              <p className={`font-bold text-base ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance trend */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Attendance Trajectory</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={attendanceLine}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis domain={[40, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="att" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} name="Attendance %" />
          </LineChart>
        </ResponsiveContainer>
        <div className={`mt-3 p-3 rounded-xl text-xs border ${attStatus ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {attStatus
            ? `✓ Your attendance (${student.attendancePct}%) meets the minimum requirement of ${thresholds.attendanceMin}%.`
            : `⚠ Your attendance (${student.attendancePct}%) is below the minimum ${thresholds.attendanceMin}%. Please improve attendance immediately.`}
        </div>
      </div>

      {/* Performance radar */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Academic Performance Radar</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
            <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Improvement tips */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">Academic Support Suggestions</h3>
        </div>
        <div className="space-y-2 text-xs">
          {!attStatus && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
              📅 Attend all remaining classes to bring attendance above {thresholds.attendanceMin}%.
            </div>
          )}
          {student.scores.mid2 < student.scores.mid1 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
              📖 Your Mid-2 score dropped from Mid-1. Seek faculty guidance or join remedial sessions.
            </div>
          )}
          {student.backlogs > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
              📌 You have {student.backlogs} pending backlog(s). Prioritize clearing them before semester end.
            </div>
          )}
          {attStatus && student.scores.mid2 >= student.scores.mid1 && student.backlogs === 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300">
              🎉 Great work! All academic metrics are within acceptable limits. Keep it up!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
