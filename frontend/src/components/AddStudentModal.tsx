import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const { addStudent } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [section, setSection] = useState('A');
  const [attendancePct, setAttendancePct] = useState('80');
  const [mid1, setMid1] = useState('22');
  const [mid2, setMid2] = useState('20');
  const [assignmentsSubmitted, setAssignmentsSubmitted] = useState('4');
  const [backlogs, setBacklogs] = useState('0');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addStudent({
        rollNo: rollNo.trim().toUpperCase(),
        name: name.trim(),
        department,
        section,
        attendancePct: Number(attendancePct),
        mid1: Number(mid1),
        mid2: Number(mid2),
        assignmentsSubmitted: Number(assignmentsSubmitted),
        totalAssignments: 5,
        backlogs: Number(backlogs),
        parentEmail: parentEmail.trim() || undefined,
        parentPhone: parentPhone.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Add New Student</h3>
              <p className="text-[11px] text-gray-400">Record academic metrics and parent contact info</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                placeholder="22G1A0516"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Attendance %</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={attendancePct}
                onChange={(e) => setAttendancePct(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mid-1 (Max 30)</label>
              <input
                type="number"
                min="0"
                max="30"
                required
                value={mid1}
                onChange={(e) => setMid1(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mid-2 (Max 30)</label>
              <input
                type="number"
                min="0"
                max="30"
                required
                value={mid2}
                onChange={(e) => setMid2(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Assignments Submitted</label>
              <input
                type="number"
                min="0"
                max="5"
                required
                value={assignmentsSubmitted}
                onChange={(e) => setAssignmentsSubmitted(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pending Backlogs</label>
              <input
                type="number"
                min="0"
                required
                value={backlogs}
                onChange={(e) => setBacklogs(e.target.value)}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-3">
            <p className="text-[11px] font-semibold text-gray-400">Parent / Guardian Information (For Progress Transparency)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Parent Email</label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Parent Mobile</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : 'Save Student to MongoDB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
