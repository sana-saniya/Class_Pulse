import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { assessRisk, getRiskColor } from '../utils/riskEngine';
import type { Student } from '../types';

type SortKey = 'name' | 'attendancePct' | 'backlogs' | 'rollNo';

export default function StudentTable({ onSelect }: { onSelect: (s: Student) => void }) {
  const { students, thresholds, selectedStudentId } = useApp();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rollNo');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [deptFilter, setDeptFilter] = useState('All');

  const departments = ['All', ...Array.from(new Set(students.map((s) => s.department))).sort()];

  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        (deptFilter === 'All' || s.department === deptFilter) &&
        (s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let va: string | number = a[sortKey];
      let vb: string | number = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : null;

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
            className="w-full bg-gray-800 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50"
          />
        </div>
        <div className="flex gap-1.5">
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                deptFilter === d
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} students</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              {[
                { key: 'rollNo' as SortKey, label: 'Roll No' },
                { key: 'name' as SortKey, label: 'Name' },
                { key: null, label: 'Dept' },
                { key: 'attendancePct' as SortKey, label: 'Attendance' },
                { key: null, label: 'Mid-1' },
                { key: null, label: 'Mid-2' },
                { key: 'backlogs' as SortKey, label: 'Backlogs' },
                { key: null, label: 'Risk' },
                { key: null, label: 'XAI' },
              ].map((col, i) => (
                <th
                  key={i}
                  onClick={() => col.key && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-gray-500 font-medium ${col.key ? 'cursor-pointer hover:text-gray-300' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.key && <SortIcon k={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const risk = assessRisk(s, thresholds);
              const colors = getRiskColor(risk.level);
              const isSelected = s.id === selectedStudentId;
              return (
                <tr
                  key={s.id}
                  onClick={() => onSelect(s)}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-600/10' : 'hover:bg-white/3'
                  }`}
                >
                  <td className="px-4 py-3 text-gray-400 font-mono">{s.rollNo}</td>
                  <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-white/5">
                      {s.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.attendancePct >= 75 ? 'bg-emerald-500' : s.attendancePct >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${s.attendancePct}%` }}
                        />
                      </div>
                      <span className={s.attendancePct < 75 ? 'text-red-400' : 'text-gray-300'}>
                        {s.attendancePct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{s.scores.mid1}<span className="text-gray-600">/30</span></td>
                  <td className="px-4 py-3 text-gray-300">{s.scores.mid2}<span className="text-gray-600">/30</span></td>
                  <td className="px-4 py-3">
                    <span className={s.backlogs > 2 ? 'text-red-400 font-semibold' : 'text-gray-300'}>
                      {s.backlogs}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {risk.level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {risk.reasons.length > 0 && (
                      <div className="relative group">
                        <AlertCircle className={`w-4 h-4 ${colors.text} cursor-help`} />
                        <div className="absolute right-0 top-6 z-20 hidden group-hover:block w-64 bg-gray-800 border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
                          <p className="text-gray-400 font-semibold mb-2">⚠ Flagged because:</p>
                          <ul className="space-y-1">
                            {risk.reasons.map((r, i) => (
                              <li key={i} className="text-gray-300 flex gap-1.5">
                                <span className="text-red-400 shrink-0">•</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-sm">No students match your filters.</div>
        )}
      </div>
    </div>
  );
}
