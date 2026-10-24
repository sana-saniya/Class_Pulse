import { GraduationCap, Wifi, WifiOff, Download, Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../api';

const ROLE_BADGE: Record<string, { label: string; emoji: string; color: string }> = {
  faculty: { label: 'Faculty',  emoji: '👨‍🏫', color: 'indigo' },
  hod:     { label: 'HOD',      emoji: '🏛️',  color: 'violet' },
  student: { label: 'Student',  emoji: '🎓',  color: 'emerald' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isOffline, generateCohort, isLoading } = useApp();

  const badge = user ? (ROLE_BADGE[user.role] ?? ROLE_BADGE.faculty) : null;

  const handleExport = () => {
    if (isOffline) {
      alert('Export is available when the backend is running.');
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

        {/* Role badge (read-only, from JWT) */}
        {badge && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-${badge.color}-500/10 border border-${badge.color}-500/20 text-xs font-medium text-${badge.color}-400`}>
            <span>{badge.emoji}</span>
            <span>{badge.label}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {user?.role !== 'student' && (
            <>
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
            </>
          )}

          {/* Online/offline */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
            isOffline
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {isOffline ? <><WifiOff className="w-3.5 h-3.5" /> Offline</> : <><Wifi className="w-3.5 h-3.5" /> Live</>}
          </div>

          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/5">
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                  <User className="w-3 h-3 text-brand-400" />
                </div>
                <span className="text-xs text-gray-400 max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
