import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import FacultyView from './views/FacultyView';
import HODView from './views/HODView';
import StudentView from './views/StudentView';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <p className="text-white font-semibold">ClassPulse</p>
        <p className="text-gray-500 text-sm mt-1">Loading dashboard…</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { role, isLoading } = useApp();
  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {role === 'faculty' && <FacultyView />}
        {role === 'hod' && <HODView />}
        {role === 'student' && <StudentView />}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
