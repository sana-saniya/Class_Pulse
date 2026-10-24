import { useState, useEffect, useCallback } from 'react';
import { Building2, Users, TrendingDown, Activity, UserPlus, Trash2, Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { assessRisk } from '../utils/riskEngine';
import AnalyticsCharts from '../components/AnalyticsCharts';
import type { FacultyUser } from '../types';

const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH'];
const DEPT_COLORS: Record<string, string> = {
  CSE: 'indigo', ECE: 'purple', EEE: 'violet', MECH: 'fuchsia',
};

export default function HODView() {
  const { students, thresholds } = useApp();
  const [activeTab, setActiveTab] = useState<'analytics' | 'faculty'>('analytics');
  const [facultyList, setFacultyList] = useState<FacultyUser[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [isAddingFaculty, setIsAddingFaculty] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFaculty = useCallback(async () => {
    setFacultyLoading(true);
    try {
      const data = await api.getFacultyList();
      setFacultyList(data);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setFacultyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'faculty') {
      void fetchFaculty();
    }
  }, [activeTab, fetchFaculty]);

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const newFaculty = await api.addFaculty({
        name: name.trim(),
        email: email.trim(),
        password,
        department,
        phone: phone.trim() || undefined,
      });
      setFacultyList((prev) => [newFaculty, ...prev]);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setIsAddingFaculty(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id: string, facultyName: string) => {
    if (window.confirm(`Are you sure you want to remove ${facultyName} from faculty?`)) {
      setDeletingId(id);
      try {
        await api.deleteFaculty(id);
        setFacultyList((prev) => prev.filter((f) => f._id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete faculty');
      } finally {
        setDeletingId(null);
      }
    }
  };

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
      {/* Top HOD navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-900 border border-white/5 rounded-2xl p-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-400" />
            Head of Department (HOD) Portal
          </h2>
          <p className="text-xs text-gray-400">Institutional analytics, early risk monitoring and faculty administration</p>
        </div>

        <div className="flex bg-gray-800 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Dept Analytics & Audits
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'faculty' ? 'bg-brand-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Manage Faculty ({facultyList.length || '•'})
          </button>
        </div>
      </div>

      {activeTab === 'faculty' ? (
        <div className="space-y-6">
          {/* Faculty Header & Add Button */}
          <div className="flex justify-between items-center bg-gray-900 border border-white/5 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Faculty Members Directory</h3>
              <p className="text-xs text-gray-400">Registered department faculty with active evaluation and intervention credentials</p>
            </div>
            <button
              onClick={() => setIsAddingFaculty(!isAddingFaculty)}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20"
            >
              <UserPlus className="w-4 h-4" />
              {isAddingFaculty ? 'Close Form' : 'Add New Faculty'}
            </button>
          </div>

          {/* Add Faculty Form */}
          {isAddingFaculty && (
            <div className="bg-gray-900 border border-brand-500/30 rounded-2xl p-5 shadow-2xl animate-in fade-in">
              <h4 className="text-sm font-semibold text-white mb-3">Add Faculty Member to MongoDB</h4>
              {formError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                  {formError}
                </div>
              )}
              <form onSubmit={handleAddFaculty} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. S. K. Murthy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="murthy@classpulse.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Temporary Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 11111"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                  >
                    {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Register Faculty'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Faculty Cards / Table */}
          <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
            {facultyLoading ? (
              <div className="p-8 text-center text-gray-500 text-xs">
                <Loader2 className="w-5 h-5 text-brand-400 animate-spin mx-auto mb-2" />
                Loading faculty accounts…
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500">
                      <th className="px-4 py-3 text-left">Faculty Name</th>
                      <th className="px-4 py-3 text-left">Email Address</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyList.map((f) => (
                      <tr key={f._id} className="border-b border-white/5 hover:bg-white/3">
                        <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs">
                            {f.name[0]}
                          </div>
                          {f.name}
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-mono text-[11px] flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gray-500" />
                          {f.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-white/5">
                            {f.department || 'CSE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {f.phone ? (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3 text-gray-500" /> {f.phone}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={deletingId === f._id}
                            onClick={() => void handleDeleteFaculty(f._id, f.name)}
                            className="px-2.5 py-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {facultyList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No faculty registered in MongoDB. Click "Add New Faculty" above to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Global KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Students', value: globalTotal, icon: Users, sub: 'Across all departments' },
              { label: 'High Risk', value: globalHigh, icon: TrendingDown, sub: globalTotal > 0 ? `${((globalHigh / globalTotal) * 100).toFixed(0)}% of cohort` : '—' },
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
        </>
      )}
    </div>
  );
}
