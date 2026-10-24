import { useState } from 'react';
import { X, Send, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Student } from '../types';

const TYPES = ['1-on-1 Counseling', 'Parent Meeting', 'Remedial Class', 'Peer Tutoring'] as const;
const STATUSES = ['Pending', 'In Progress', 'Resolved'] as const;

function generateEmail(student: Student, type: string, notes: string): string {
  return `Subject: Academic Support Intervention Notice – ${student.rollNo}

Dear Parent/Guardian of ${student.name},

This is to inform you that your ward has been identified for academic support under our Early Intervention Programme aligned with NEP 2020 guidelines.

Student Details:
  • Name       : ${student.name}
  • Roll No    : ${student.rollNo}
  • Department : ${student.department}, Section ${student.section}

Intervention Type : ${type}
Current Status    : Attendance – ${student.attendancePct}% | Mid-1: ${student.scores.mid1}/30 | Mid-2: ${student.scores.mid2}/30

Remarks: ${notes || 'Scheduled for academic counselling session.'}

We kindly request your cooperation in supporting your ward's academic progress.

Regards,
Faculty / Academic Coordinator
JNTUA – ClassPulse Dashboard`;
}

export default function InterventionModal({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) {
  const { addIntervention } = useApp();
  const [type, setType] = useState<(typeof TYPES)[number]>('1-on-1 Counseling');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('Pending');
  const [actionTakenBy, setActionTakenBy] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'log' | 'email'>('log');

  const emailDraft = generateEmail(student, type, notes);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!actionTakenBy.trim()) return;
    setSaving(true);
    try {
      await addIntervention(student.id, { type, notes, status, actionTakenBy });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-sm font-semibold text-white">Log Intervention</h2>
            <p className="text-xs text-gray-500 mt-0.5">{student.name} · {student.rollNo}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(['log', 'email'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                tab === t ? 'text-white border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'log' ? '📝 Log Action' : '📧 Draft Email'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {tab === 'log' ? (
            <>
              {/* Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Intervention Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                        type === t
                          ? 'bg-brand-600/20 border-brand-500/50 text-white'
                          : 'bg-gray-800 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action By */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Action Taken By *</label>
                <input
                  value={actionTakenBy}
                  onChange={(e) => setActionTakenBy(e.target.value)}
                  placeholder="e.g. Dr. Sharma"
                  className="w-full bg-gray-800 border border-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500/50"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Status</label>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        status === s
                          ? 'bg-brand-600/20 border-brand-500/50 text-white'
                          : 'bg-gray-800 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe the intervention taken…"
                  className="w-full bg-gray-800 border border-white/5 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-brand-500/50"
                />
              </div>

              <button
                onClick={() => void handleSubmit()}
                disabled={!actionTakenBy.trim() || saving}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Saving…' : 'Log Intervention'}
              </button>
            </>
          ) : (
            <>
              <textarea
                readOnly
                value={emailDraft}
                rows={14}
                className="w-full bg-gray-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono resize-none focus:outline-none"
              />
              <button
                onClick={() => void handleCopy()}
                className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 border border-white/5 transition-colors"
              >
                {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy to Clipboard</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
