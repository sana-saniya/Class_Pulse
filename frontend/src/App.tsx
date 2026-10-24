import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import FacultyView from './views/FacultyView';
import HODView from './views/HODView';
import StudentView from './views/StudentView';
import { Loader2 } from 'lucide-react';

function Spinner({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
        </div>
        <p className="text-gray-500 text-sm">{text}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { isLoading } = useApp();

  if (isLoading) return <Spinner text="Loading dashboard…" />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {user?.role === 'faculty'  && <FacultyView />}
        {user?.role === 'hod'      && <HODView />}
        {user?.role === 'student'  && <StudentView />}
        {!user?.role && (
          <div className="text-center text-gray-500 py-20">
            Unknown role. Please contact your administrator.
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Still checking localStorage / verifying token
  if (isLoading) return <Spinner text="Checking session…" />;

  // Not logged in → show login
  if (!isAuthenticated) return <LoginPage />;

  // Logged in → show dashboard
  return <Dashboard />;
}
