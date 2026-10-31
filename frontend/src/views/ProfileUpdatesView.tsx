import { useState } from 'react';
import {
  Phone,
  Clock3,
  Check,
  X,
  Loader2,
  CheckCircle2,
  UserCheck,
  ArrowLeft,
  ShieldAlert,
  InboxIcon,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProfileUpdatesViewProps {
  onBack: () => void;
}

export default function ProfileUpdatesView({ onBack }: ProfileUpdatesViewProps) {
  const { students, approveProfileUpdate, rejectProfileUpdate } = useApp();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Only students who have a pending profile update request
  const pendingStudents = students.filter(
    (s) => s.pendingProfileUpdate && s.pendingProfileUpdate.status === 'Pending'
  );

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleApprove = async (studentId: string, studentName: string) => {
    setProcessingId(studentId);
    try {
      await approveProfileUpdate(studentId);
      showFeedback('success', `Approved contact update for ${studentName}. Records updated.`);
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to approve update');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (studentId: string, studentName: string) => {
    const reason = window.prompt(
      `Reason for rejecting ${studentName}'s request:`,
      'Unable to verify. Please visit the office with valid ID.'
    );
    if (reason === null) return;
    setProcessingId(studentId);
    try {
      await rejectProfileUpdate(studentId, reason);
      showFeedback('success', `Rejected contact update request for ${studentName}.`);
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-gray-800 border border-white/10 hover:bg-gray-700 text-gray-400 hover:text-white transition-all shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-3">
                Student Profile Update Requests
                {pendingStudents.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Clock3 className="w-3 h-3 animate-pulse" />
                    {pendingStudents.length} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Review phone number change requests from mentee students. Only students who submitted a request appear here.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 border border-white/5 rounded-xl px-3 py-2">
            <UserCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            <span>Approvals are logged as auditable records</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 border rounded-xl text-xs flex items-center gap-2.5 ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      )}

      {pendingStudents.length === 0 ? (
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <InboxIcon className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No Pending Requests</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            No mentee students have submitted a contact information change request yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pendingStudents.map((student) => {
            const req = student.pendingProfileUpdate!;
            const isProcessing = processingId === student.id;
            const submittedDate = req.requestedAt
              ? new Date(req.requestedAt).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : 'Unknown';

            return (
              <div
                key={student.id}
                className="bg-gray-900 border border-amber-500/20 rounded-2xl overflow-hidden flex flex-col shadow-lg shadow-amber-500/5 hover:border-amber-500/40 transition-all"
              >
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-brand-600/20">
                      {student.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{student.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {student.rollNo} · {student.department} – Sec {student.section}
                      </p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 uppercase tracking-wide">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    Submitted: {submittedDate}
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1">
                  {req.phone && (
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-brand-400" />
                        Student Phone
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 line-through font-mono">{student.phone || 'Not set'}</span>
                        <span className="text-gray-500">?</span>
                        <span className="font-mono font-bold text-brand-300 bg-brand-500/20 border border-brand-500/30 px-2 py-0.5 rounded-lg">
                          {req.phone}
                        </span>
                      </div>
                    </div>
                  )}
                  {req.parentPhone && (
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        Parent Phone
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 line-through font-mono">{student.parentPhone || 'Not set'}</span>
                        <span className="text-gray-500">?</span>
                        <span className="font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                          {req.parentPhone}
                        </span>
                      </div>
                    </div>
                  )}
                  {req.reason && (
                    <div className="p-2.5 bg-gray-800/60 rounded-xl border border-white/5">
                      <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Reason
                      </p>
                      <p className="text-xs text-gray-300 italic leading-relaxed">&ldquo;{req.reason}&rdquo;</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/5 flex items-center gap-2.5">
                  <button
                    onClick={() => void handleApprove(student.id, student.name)}
                    disabled={isProcessing}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {isProcessing ? 'Processing…' : 'Approve & Apply'}
                  </button>
                  <button
                    onClick={() => void handleReject(student.id, student.name)}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-gray-800 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
