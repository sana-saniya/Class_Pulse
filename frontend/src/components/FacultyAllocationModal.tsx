import { useState } from 'react';
import { X, Users, AlertTriangle, TrendingDown, CheckCircle2, Search, MessageSquare, Phone, MapPin, Sparkles, Loader2 } from 'lucide-react';
import type { FacultyUser, Student } from '../types';
import { assessRisk, getRiskColor } from '../utils/riskEngine';
import { useApp } from '../context/AppContext';

interface FacultyAllocationModalProps {
  faculty: FacultyUser;
  allocatedStudents: Student[];
  allFaculty: FacultyUser[];
  onClose: () => void;
  onOpenIntervention?: (student: Student) => void;
}

export default function FacultyAllocationModal({
  faculty,
  allocatedStudents,
  allFaculty,
  onClose,
  onOpenIntervention,
}: FacultyAllocationModalProps) {
  const { students, assignStudent, thresholds } = useApp();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High Risk' | 'Medium Risk' | 'On Track'>('All');
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');

  // Unassigned or students assigned to others
  const unassignedOrOtherStudents = students.filter(
    (s) => s.assignedFacultyId !== faculty._id && !allocatedStudents.some((a) => a.id === s.id)
  );

  const filteredStudents = allocatedStudents.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || (s.homeDistrict && s.homeDistrict.toLowerCase().includes(q));
    const risk = assessRisk(s, thresholds).level;
    const matchesRisk = riskFilter === 'All' || risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const highRiskCount = allocatedStudents.filter((s) => assessRisk(s, thresholds).level === 'High Risk').length;
  const medRiskCount = allocatedStudents.filter((s) => assessRisk(s, thresholds).level === 'Medium Risk').length;
  const onTrackCount = allocatedStudents.length - highRiskCount - medRiskCount;
  const avgAtt = allocatedStudents.length > 0
    ? +(allocatedStudents.reduce((a, s) => a + s.attendancePct, 0) / allocatedStudents.length).toFixed(1)
    : 0;

  const handleReassign = async (studentId: string, targetFacultyId: string) => {
    setReassigningId(studentId);
    try {
      await assignStudent(studentId, targetFacultyId || null);
    } catch (err) {
      alert('Failed to reassign student');
    } finally {
      setReassigningId(null);
    }
  };

  const handleAddStudentToThisFaculty = async () => {
    if (!selectedStudentToAdd) return;
    setReassigningId(selectedStudentToAdd);
    try {
      await assignStudent(selectedStudentToAdd, faculty._id);
      setSelectedStudentToAdd('');
      setIsAddingStudent(false);
    } catch (err) {
      alert('Failed to assign student');
    } finally {
      setReassigningId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-300 font-bold flex items-center justify-center text-lg border border-brand-500/30">
              {faculty.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{faculty.name}</h3>
                <span className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[11px] font-semibold">
                  {faculty.department || 'CSE'} Mentor
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                <span>{faculty.email}</span>
                {faculty.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-500" /> {faculty.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddingStudent(!isAddingStudent)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-white/10 text-xs font-semibold text-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-brand-400" />
              {isAddingStudent ? 'Cancel Add' : 'Assign Student'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Assign Section */}
        {isAddingStudent && (
          <div className="p-4 bg-brand-950/40 border-b border-brand-500/20 flex flex-wrap items-center gap-3 animate-in fade-in">
            <span className="text-xs text-brand-200 font-medium">Select student to allocate to {faculty.name}:</span>
            <select
              value={selectedStudentToAdd}
              onChange={(e) => setSelectedStudentToAdd(e.target.value)}
              className="bg-gray-800 border border-brand-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose Student to Assign --</option>
              {unassignedOrOtherStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNo} - {s.name} ({s.department}-{s.section})
                </option>
              ))}
            </select>
            <button
              onClick={() => void handleAddStudentToThisFaculty()}
              disabled={!selectedStudentToAdd || reassigningId === selectedStudentToAdd}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              {reassigningId === selectedStudentToAdd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Allocation'}
            </button>
          </div>
        )}

        {/* Cohort Stats & Distribution summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-white/5 bg-gray-900/60">
          <div className="bg-gray-800/80 rounded-xl p-3 border border-white/5">
            <div className="flex justify-between items-center text-gray-400 text-[11px]">
              <span>Allocated Cohort</span>
              <Users className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <p className="text-xl font-bold text-white mt-1">
              {allocatedStudents.length} <span className="text-xs font-normal text-gray-400">/ {students.length} total</span>
            </p>
            <p className="text-[10px] text-brand-400 mt-0.5">
              {students.length > 0 ? Math.round((allocatedStudents.length / students.length) * 100) : 0}% department quota
            </p>
          </div>

          <div className="bg-gray-800/80 rounded-xl p-3 border border-white/5">
            <div className="flex justify-between items-center text-gray-400 text-[11px]">
              <span>High Risk Students</span>
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            </div>
            <p className="text-xl font-bold text-red-400 mt-1">{highRiskCount}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Immediate intervention priority</p>
          </div>

          <div className="bg-gray-800/80 rounded-xl p-3 border border-white/5">
            <div className="flex justify-between items-center text-gray-400 text-[11px]">
              <span>Medium Risk</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-400 mt-1">{medRiskCount}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Attendance / test drop alert</p>
          </div>

          <div className="bg-gray-800/80 rounded-xl p-3 border border-white/5">
            <div className="flex justify-between items-center text-gray-400 text-[11px]">
              <span>Avg Attendance</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className={`text-xl font-bold mt-1 ${avgAtt < 75 ? 'text-red-400' : 'text-emerald-400'}`}>
              {avgAtt}%
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{onTrackCount} students on track</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-3 border-b border-white/5 flex flex-wrap gap-2 items-center justify-between bg-gray-900">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assigned students by name, roll no, or district..."
              className="w-full bg-gray-800 border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>

          <div className="flex gap-1.5">
            {(['All', 'High Risk', 'Medium Risk', 'On Track'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  riskFilter === r
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              {allocatedStudents.length === 0
                ? 'No students are currently allocated to this faculty member. Use "Assign Student" above or the "⚡ Auto-Distribute Cohort" button to balance cohort.'
                : 'No students match your filter criteria.'}
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-800/50 sticky top-0 border-b border-white/5 text-gray-400">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Roll No</th>
                  <th className="px-4 py-2.5 text-left font-medium">Student Name</th>
                  <th className="px-4 py-2.5 text-left font-medium">Class</th>
                  <th className="px-4 py-2.5 text-left font-medium">Attendance</th>
                  <th className="px-4 py-2.5 text-left font-medium">Scores</th>
                  <th className="px-4 py-2.5 text-left font-medium">Risk Status</th>
                  <th className="px-4 py-2.5 text-left font-medium">Reassign Mentor</th>
                  <th className="px-4 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.map((s) => {
                  const risk = assessRisk(s, thresholds);
                  const colors = getRiskColor(risk.level);
                  const isBusy = reassigningId === s.id;

                  return (
                    <tr key={s.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-300 font-medium">{s.rollNo}</td>
                      <td className="px-4 py-3 text-white font-medium">
                        <div className="flex flex-col">
                          <span>{s.name}</span>
                          {s.homeDistrict && (
                            <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-brand-400" />
                              {s.homeDistrict}, {s.state || 'AP'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-white/5">
                          {s.department}-{s.section}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.attendancePct >= 75 ? 'bg-emerald-500' : s.attendancePct >= 65 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${s.attendancePct}%` }}
                            />
                          </div>
                          <span className={s.attendancePct < 75 ? 'text-red-400 font-medium' : 'text-gray-300'}>
                            {s.attendancePct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        <span>{s.scores.mid1}/{s.scores.mid2}</span>
                        {s.backlogs > 0 && (
                          <span className="ml-1.5 text-red-400 font-semibold">({s.backlogs} BL)</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {risk.level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          disabled={isBusy}
                          value={faculty._id}
                          onChange={(e) => void handleReassign(s.id, e.target.value)}
                          className="bg-gray-800 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-gray-300 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                        >
                          <option value={faculty._id}>{faculty.name} (Current)</option>
                          {allFaculty
                            .filter((other) => other._id !== faculty._id)
                            .map((other) => (
                              <option key={other._id} value={other._id}>
                                Transfer to {other.name} ({other.department || 'Dept'})
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {onOpenIntervention && (
                          <button
                            type="button"
                            onClick={() => onOpenIntervention(s)}
                            className="px-2.5 py-1 text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Intervene
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gray-900 flex justify-between items-center text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            ClassPulse Mentor Workload Balancer aligns with NEP 2020 faculty:student ratios
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
