import { Brain, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { assessRisk, getRiskColor } from '../utils/riskEngine';
import { useApp } from '../context/AppContext';
import type { Student } from '../types';

export default function XAICard({ student }: { student: Student }) {
  const { thresholds } = useApp();
  const risk = assessRisk(student, thresholds);
  const colors = getRiskColor(risk.level);

  const Icon = risk.level === 'High Risk' ? XCircle : risk.level === 'Medium Risk' ? AlertTriangle : CheckCircle2;

  return (
    <div className={`bg-gray-900 border rounded-2xl p-5 ${colors.border}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
            <Brain className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Risk Explanation</h3>
            <p className="text-xs text-gray-500">Why this student was flagged</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
          <Icon className="w-3.5 h-3.5" />
          {risk.level}
        </span>
      </div>

      {risk.reasons.length === 0 ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          All metrics are within acceptable thresholds. Student is on track.
        </div>
      ) : (
        <div className="space-y-2">
          {risk.reasons.map((reason, i) => (
            <div key={i} className={`flex gap-2 items-start p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
              <span className={`mt-0.5 text-xs font-bold ${colors.text}`}>{i + 1}</span>
              <p className="text-xs text-gray-300 leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Score sparkline */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Attendance</p>
          <p className={`text-lg font-bold ${student.attendancePct < thresholds.attendanceMin ? 'text-red-400' : 'text-emerald-400'}`}>
            {student.attendancePct}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Score Drop</p>
          <p className={`text-lg font-bold ${risk.scoreDrop > thresholds.scoreDropMax ? 'text-red-400' : 'text-emerald-400'}`}>
            {risk.scoreDrop > 0 ? '-' : '+'}{Math.abs(risk.scoreDrop).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Backlogs</p>
          <p className={`text-lg font-bold ${student.backlogs > thresholds.backlogsMax ? 'text-red-400' : 'text-emerald-400'}`}>
            {student.backlogs}
          </p>
        </div>
      </div>
    </div>
  );
}
