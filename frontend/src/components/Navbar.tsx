import { GraduationCap, Wifi, WifiOff, Download, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import type { Role } from '../types';

const ROLES: { value: Role; label: string; emoji: string }[] = [
  { value: 'faculty', label: 'Faculty', emoji: '👨‍🏫' },
  { value: 'hod',     label: 'HOD',     emoji: '🏛️' },
  { value: 'student', label: 'Student', emoji: '🎓' },
];

export default function Navbar() {
  const { role, setRole, isOffline, generateCohort, isLoading } = useApp();

  const handleExport = () => {
    if (isOffline) {
      alert('Export is available when backend is running.');
      return;
    }
    api.exportCSV();
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur border-b border-white/5">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight">ClassPulse</span>
            <span className="block text-[10px] text-gray-500 leading-none -mt-0.5">JNTUA · NEP 2020</span>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1 bg-gray-900 border border-white/5 rounded-xl p-1">
          {ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                role === r.value
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => void generateCohort()}
            disabled={isOffline || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Cohort
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Connectivity badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
            isOffline
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {isOffline
              ? <><WifiOff className="w-3.5 h-3.5" /> Offline</>
              : <><Wifi className="w-3.5 h-3.5" /> Live</>
            }
          </div>
        </div>
      </div>
    </header>
  );
}
