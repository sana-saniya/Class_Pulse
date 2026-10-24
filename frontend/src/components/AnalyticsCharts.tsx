import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { assessRisk } from '../utils/riskEngine';

const COLORS = { 'High Risk': '#f87171', 'Medium Risk': '#fbbf24', 'On Track': '#34d399' };
const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

export default function AnalyticsCharts() {
  const { students, thresholds } = useApp();

  // Risk distribution
  const riskCount = students.reduce(
    (acc, s) => { acc[assessRisk(s, thresholds).level]++; return acc; },
    { 'High Risk': 0, 'Medium Risk': 0, 'On Track': 0 },
  );
  const riskData = Object.entries(riskCount).map(([name, value]) => ({ name, value }));

  // Dept-wise attendance avg
  const depts = ['CSE', 'ECE', 'EEE', 'MECH'];
  const deptData = depts.map((dept) => {
    const group = students.filter((s) => s.department === dept);
    const avgAtt = group.length ? group.reduce((a, s) => a + s.attendancePct, 0) / group.length : 0;
    const avgMid1 = group.length ? group.reduce((a, s) => a + s.scores.mid1, 0) / group.length : 0;
    const avgMid2 = group.length ? group.reduce((a, s) => a + s.scores.mid2, 0) / group.length : 0;
    const atRisk = group.filter((s) => assessRisk(s, thresholds).level !== 'On Track').length;
    return { dept, avgAtt: +avgAtt.toFixed(1), avgMid1: +avgMid1.toFixed(1), avgMid2: +avgMid2.toFixed(1), atRisk, total: group.length };
  });

  // Score progression for bar chart
  const scoreData = students.slice(0, 8).map((s) => ({
    name: s.name.split(' ')[0],
    mid1: s.scores.mid1,
    mid2: s.scores.mid2,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Risk Donut */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Risk Distribution</h3>
        <p className="text-xs text-gray-500 mb-4">Across all students in cohort</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={riskData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {riskData.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }}
              labelStyle={{ color: '#9ca3af' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {riskData.map((r) => (
            <div key={r.name} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[r.name as keyof typeof COLORS] }} />
              {r.name} ({r.value})
            </div>
          ))}
        </div>
      </div>

      {/* Dept Attendance */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Dept-wise Attendance</h3>
        <p className="text-xs text-gray-500 mb-4">Average attendance % by department</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={80} data={deptData} startAngle={180} endAngle={0}>
            <RadialBar dataKey="avgAtt" label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}>
              {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i]} />)}
            </RadialBar>
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {deptData.map((d, i) => (
            <div key={d.dept} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: DEPT_COLORS[i] }} />
              {d.dept} {d.avgAtt}%
            </div>
          ))}
        </div>
      </div>

      {/* Score Progression */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-white mb-1">Mid-Exam Score Progression</h3>
        <p className="text-xs text-gray-500 mb-4">Mid-1 vs Mid-2 comparison (out of 30)</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={scoreData} margin={{ right: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis domain={[0, 30]} tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
            <Line type="monotone" dataKey="mid1" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="Mid-1" />
            <Line type="monotone" dataKey="mid2" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} name="Mid-2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dept Risk Heatmap (bar) */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-white mb-1">At-Risk Students by Department</h3>
        <p className="text-xs text-gray-500 mb-4">Number of flagged students per department</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={deptData} margin={{ right: 20, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="dept" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="atRisk" name="At Risk" radius={[4, 4, 0, 0]}>
              {deptData.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
