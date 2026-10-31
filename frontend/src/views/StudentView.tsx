import { useState } from 'react';
import {
  Shield,
  TrendingUp,
  BookOpen,
  Clock,
  Phone,
  UserCheck,
  Clock3,
  Edit3,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// Shows the logged-in student's own data matched by rollNo
export default function StudentView() {
  const { students, facultyList, thresholds, requestProfileUpdate, cancelProfileUpdate } = useApp();
  const { user } = useAuth();

  // Match by rollNo from the JWT — fall back to first student for demo
  const student = students.find((s) => s.rollNo === user?.rollNo) ?? students[0];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [parentPhoneInput, setParentPhoneInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!student) return <div className="text-gray-500 text-sm">Loading...</div>;

  // Find assigned faculty mentor
  const assignedMentor = facultyList.find((f) => f._id === student.assignedFacultyId);

  const handleOpenEdit = () => {
    setPhoneInput(student.phone || '');
    setParentPhoneInput(student.parentPhone || '');
    setReasonInput('');
    setErrorMessage(null);
    setStatusMessage(null);
    setIsEditModalOpen(true);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!phoneInput.trim() && !parentPhoneInput.trim()) {
      setErrorMessage('Please provide at least a student phone number or parent phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestProfileUpdate(student.id, {
        phone: phoneInput.trim() || undefined,
        parentPhone: parentPhoneInput.trim() || undefined,
        reason: reasonInput.trim() || 'Student requested contact number update',
      });
      setStatusMessage('Request submitted! Your assigned faculty mentor will review and approve the change.');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setStatusMessage(null);
      }, 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit profile update request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (window.confirm('Are you sure you want to cancel your pending contact update request?')) {
      try {
        await cancelProfileUpdate(student.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to cancel request');
      }
    }
  };

  // Simulate 8-week attendance trend converging to current value
  const base = student.attendancePct;
  const attendanceLine = [
    { week: 'Week 1', att: Math.min(100, Math.round(base + 12 + Math.random() * 3)) },
    { week: 'Week 2', att: Math.min(100, Math.round(base +  8 + Math.random() * 3)) },
    { week: 'Week 3', att: Math.min(100, Math.round(base +  5 + Math.random() * 3)) },
    { week: 'Week 4', att: Math.min(100, Math.round(base +  3 + Math.random() * 2)) },
    { week: 'Week 5', att: Math.min(100, Math.round(base +  1)) },
    { week: 'Week 6', att: Math.min(100, Math.round(base -  1)) },
    { week: 'Week 7', att: Math.min(100, Math.round(base)) },
    { week: 'Week 8', att: Math.min(100, base) },
  ].map(w => ({ ...w, att: Math.max(0, w.att) }));

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
          <p className="text-sm font-semibold text-white">Privacy-Protected Student Portal</p>
          <p className="text-xs text-gray-400 mt-0.5">Only your personal academic data is shown. No peer comparisons or rankings.</p>
        </div>
      </div>

      {/* Student Profile & Contact Details Card */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 border border-brand-500/30 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-600/20">
              {student.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base">{student.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  {student.department} · Sec {student.section}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{student.rollNo}</p>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-750 hover:border-brand-500/40 border border-white/10 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5 text-brand-400" />
            Edit Profile Contact
          </button>
        </div>

        {/* Assigned Faculty Mentor banner */}
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Assigned Faculty Mentor</p>
              <p className="text-white font-semibold text-xs mt-0.5">
                {assignedMentor ? assignedMentor.name : 'Faculty Mentor Allocation in Progress'}
              </p>
              {assignedMentor && (
                <p className="text-gray-400 text-[11px] mt-0.5">
                  {assignedMentor.department} Dept · {assignedMentor.email}
                </p>
              )}
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Mentor Approver
          </span>
        </div>

        {/* Contact info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-gray-800/80 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-400" />
                Student Phone Number
              </span>
              <span className="text-[10px] text-gray-500">Official</span>
            </div>
            <p className="text-white font-semibold text-sm font-mono">
              {student.phone || '+91 98765 43210'}
            </p>
          </div>

          <div className="p-3 bg-gray-800/80 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-[11px] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Parent / Guardian Phone
              </span>
              <span className="text-[10px] text-gray-500">Emergency</span>
            </div>
            <p className="text-white font-semibold text-sm font-mono">
              {student.parentPhone || 'Not provided'}
            </p>
          </div>
        </div>

        {/* Pending Approval Banner if request is submitted */}
        {student.pendingProfileUpdate && student.pendingProfileUpdate.status === 'Pending' && (
          <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Clock3 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-amber-300">Contact Change Request Pending Faculty Approval</p>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 uppercase tracking-wider border border-amber-500/30">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">
                    You requested to change your contact phone to{' '}
                    <span className="font-semibold text-white font-mono bg-gray-800 px-1.5 py-0.5 rounded">
                      {student.pendingProfileUpdate.phone || 'N/A'}
                    </span>
                    {student.pendingProfileUpdate.parentPhone && (
                      <> and parent phone to <span className="font-semibold text-white font-mono bg-gray-800 px-1.5 py-0.5 rounded">{student.pendingProfileUpdate.parentPhone}</span></>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Mentor: <span className="text-indigo-300 font-medium">{assignedMentor?.name || 'Assigned Faculty'}</span> ({student.department} Dept)
                    {student.pendingProfileUpdate.reason && ` · Note: "${student.pendingProfileUpdate.reason}"`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelRequest}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors shrink-0 underline text-[11px]"
              >
                Cancel Request
              </button>
            </div>
          </div>
        )}

        {/* Academic KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mt-4">
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

      {/* Modal for Requesting Student Profile Update */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-400" />
                  Request Contact Information Update
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Updates require approval from your assigned faculty mentor
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Institutional verification notice */}
            <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-brand-300 mb-4 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Faculty Approval Required</p>
                <p className="text-gray-300 text-[11px] mt-0.5">
                  To protect student academic records, any change to your phone number must be approved by your mentor{' '}
                  <strong className="text-white">{assignedMentor?.name || 'Assigned Faculty'}</strong> before taking effect.
                </p>
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1.5">
                  New Student Phone Number <span className="text-brand-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-1">Current: {student.phone || '+91 98765 43210'}</p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">
                  Parent / Emergency Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={parentPhoneInput}
                  onChange={(e) => setParentPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all font-mono"
                />
                <p className="text-[10px] text-gray-500 mt-1">Current: {student.parentPhone || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">
                  Reason for Contact Update
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Changed personal mobile carrier / New family contact number"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  {isSubmitting ? 'Submitting…' : 'Submit for Faculty Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
