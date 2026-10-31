import { useState } from 'react';
import { X, Send, Copy, Check, MessageCircle, Smartphone, Globe, CheckCircle2, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Student } from '../types';
import { detectStudentLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../utils/languageRouter';
import { generateLocalizedNotification } from '../utils/notificationTemplates';
import { buildWhatsAppLink, queueOfflineSMS } from '../utils/messagingGateway';

const TYPES = ['1-on-1 Counseling', 'Parent Meeting', 'Remedial Class', 'Peer Tutoring'] as const;
const STATUSES = ['Pending', 'In Progress', 'Resolved'] as const;

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
  const [tab, setTab] = useState<'log' | 'outreach'>('log');

  // Auto-detect native language based on homeDistrict / state, allow override
  const autoLang = detectStudentLanguage(student);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(autoLang);
  const [smsQueuedNotice, setSmsQueuedNotice] = useState<string | null>(null);

  const localizedDraft = generateLocalizedNotification(
    {
      student,
      facultyName: actionTakenBy || 'Department Faculty',
      interventionType: type,
      notes,
    },
    selectedLanguage
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localizedDraft.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppDispatch = () => {
    const phone = student.parentPhone || '+919876543210';
    const waUrl = buildWhatsAppLink(phone, localizedDraft.message);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOfflineSMSDispatch = () => {
    const phone = student.parentPhone || '+919876543210';
    queueOfflineSMS({
      studentId: student.id,
      studentName: student.name,
      recipientPhone: phone,
      message: localizedDraft.message,
      language: selectedLanguage,
    });
    setSmsQueuedNotice(`SMS notice queued for ${phone} in ${SUPPORTED_LANGUAGES[selectedLanguage].name}.`);
    setTimeout(() => setSmsQueuedNotice(null), 4000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gray-800/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Log Academic Intervention</h2>
              <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 text-[10px] font-semibold">
                NEP 2020 Continuous Care
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
              <span>{student.name} ({student.rollNo})</span>
              <span>•</span>
              <span>{student.department}-{student.section}</span>
              {student.homeDistrict && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-3 h-3 text-brand-400" />
                    {student.homeDistrict}
                  </span>
                </>
              )}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-gray-900">
          <button
            onClick={() => setTab('log')}
            className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
              tab === 'log' ? 'text-white border-b-2 border-brand-500 bg-brand-500/5' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            📝 Log Record
          </button>
          <button
            onClick={() => setTab('outreach')}
            className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
              tab === 'outreach' ? 'text-white border-b-2 border-brand-500 bg-brand-500/5' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-brand-400" />
            Multilingual Parental Outreach ({SUPPORTED_LANGUAGES[selectedLanguage].nativeName})
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {tab === 'log' ? (
            <>
              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Intervention Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                        type === t
                          ? 'bg-brand-600/20 border-brand-500/50 text-white shadow-sm'
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Action Taken By *</label>
                <input
                  value={actionTakenBy}
                  onChange={(e) => setActionTakenBy(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Follow-up Status</label>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        status === s
                          ? s === 'Resolved'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : s === 'In Progress'
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-brand-600/20 border-brand-500/50 text-white'
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
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Intervention Notes & Clinical Observations</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Reason for intervention, discussions with student, remedial assignments..."
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 resize-none focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                onClick={() => void handleSubmit()}
                disabled={!actionTakenBy.trim() || saving}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-600/20"
              >
                <Send className="w-4 h-4" />
                {saving ? 'Saving Intervention…' : 'Save & Log Intervention'}
              </button>
            </>
          ) : (
            <>
              {/* Language Selection & Detection Bar */}
              <div className="p-3 bg-gray-800/80 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-brand-400" />
                    Auto-Routed Regional Language:
                  </span>
                  <span className="text-[10px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                    Detected via Region: {student.homeDistrict || 'Andhra / JNTUA'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                  {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((code) => {
                    const l = SUPPORTED_LANGUAGES[code];
                    const active = selectedLanguage === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setSelectedLanguage(code)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                          active
                            ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                            : 'bg-gray-800 text-gray-400 hover:text-white border-white/5'
                        }`}
                      >
                        <p className="font-bold text-[11px] leading-tight">{l.nativeName}</p>
                        <p className="text-[9px] opacity-75">{l.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {smsQueuedNotice && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{smsQueuedNotice}</span>
                </div>
              )}

              {/* Message Draft Preview */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Parent Message Preview ({SUPPORTED_LANGUAGES[selectedLanguage].name})
                </label>
                <textarea
                  readOnly
                  value={localizedDraft.message}
                  rows={9}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl p-3 text-xs text-gray-200 font-sans leading-relaxed resize-none focus:outline-none"
                />
              </div>

              {/* Dispatch Action Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleWhatsAppDispatch}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleOfflineSMSDispatch}
                  className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Smartphone className="w-4 h-4" />
                  Queue SMS Notice
                </button>

                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied Draft' : 'Copy Text'}
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center">
                Dispatches to parent contact: {student.parentPhone || '+91 98765 43210'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
