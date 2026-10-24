import { Building2, Users, TrendingDown, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { assessRisk } from '../utils/riskEngine';
import AnalyticsCharts from '../components/AnalyticsCharts';

const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH'];
const DEPT_COLORS: Record<string, string> = {
  CSE: 'indigo', ECE: 'purple', EEE: 'violet', MECH: 'fuchsia',
};

export default function HODView() {
  const { students, thresholds } = useApp();

  const deptStats = DEPTS.map((dept) => {
    const group = students.filter((s) => s.department === dept);
    const risks = group.map((s) => assessRisk(s, thresholds).level);
    const high = risks.filter((r) => r === 'High Risk').length;
    const med = risks.filter((r) => r === 'Medium Risk').length;
    const avgAtt = group.length ? +(group.reduce((a, s) => a + s.attendancePct, 0) / group.length).toFixed(1) : 0;
    const interventions = group.reduce((a, s) => a + s.interventions.length, 0);
    return { dept, total: group.length, high, med, onTrack: group.length - high - med, avgAtt, interventions };
  });

  const globalHigh = deptStats.reduce((a, d) => a + d.high, 0);
  const globalTotal = students.length;
  const interventionTotal = students.reduce((a, s) => a + s.interventions.length, 0);

  return (
    <div className="space-y-6">
      {/* Global KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: globalTotal, icon: Users, sub: 'Across all departments' },
          { label: 'High Risk', value: globalHigh, icon: TrendingDown, sub: `${((globalHigh / globalTotal) * 100).toFixed(0)}% of cohort` },
          { label: 'Departments', value: DEPTS.length, icon: Building2, sub: 'CSE · ECE · EEE · MECH' },
          { label: 'Interventions Logged', value: interventionTotal, icon: Activity, sub: 'Total actions taken' },
        ].map((k) => (
          <div key={k.label} className="bg-gray-900 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
              <k.icon className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{k.value}</p>
              <p className="text-xs text-gray-500">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Dept cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {deptStats.map((d) => {
          const color = DEPT_COLORS[d.dept];
          return (
            <div key={d.dept} className="bg-gray-900 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
                  {d.dept}
                </div>
                <span className="text-xs text-gray-500">{d.total} students</span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Risk Breakdown</p>
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {d.high > 0 && <div className="bg-red-500 rounded-full" style={{ flex: d.high }} />}
                  {d.med > 0 && <div className="bg-amber-500 rounded-full" style={{ flex: d.med }} />}
                  {d.onTrack > 0 && <div className="bg-emerald-500 rounded-full" style={{ flex: d.onTrack }} />}
                </div>
                <div className="flex gap-3 mt-1.5 text-[10px] text-gray-500">
                  <span className="text-red-400">{d.high} high</span>
                  <span className="text-amber-400">{d.med} med</span>
                  <span className="text-emerald-400">{d.onTrack} ok</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 rounded-xl p-2">
                  <p className="text-gray-500 text-[10px]">Avg Attendance</p>
                  <p className={`font-bold mt-0.5 ${d.avgAtt < 75 ? 'text-red-400' : 'text-emerald-400'}`}>{d.avgAtt}%</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2">
                  <p className="text-gray-500 text-[10px]">Interventions</p>
                  <p className="font-bold mt-0.5 text-white">{d.interventions}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <AnalyticsCharts />

      {/* Audit log */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Faculty Intervention Audit Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {['Student', 'Roll No', 'Dept', 'Intervention', 'By', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.flatMap((s) =>
                s.interventions.map((iv) => (
                  <tr key={iv.id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="px-3 py-2 text-white">{s.name}</td>
                    <td className="px-3 py-2 text-gray-400 font-mono">{s.rollNo}</td>
                    <td className="px-3 py-2 text-gray-400">{s.department}</td>
                    <td className="px-3 py-2 text-gray-300">{iv.type}</td>
                    <td className="px-3 py-2 text-gray-400">{iv.actionTakenBy}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        iv.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400'
                        : iv.status === 'In Progress' ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-gray-700 text-gray-400'
                      }`}>{iv.status}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{iv.date}</td>
                  </tr>
                )),
              )}
              {students.every((s) => s.interventions.length === 0) && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No interventions logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
