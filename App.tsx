
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import KBView from './pages/KBView';
import ProfileGate from './pages/ProfileGate';
import ComingSoon from './pages/ComingSoon';
import { MOCK_USER } from './constants';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile Lock Logic: If profile isn't complete, force redirection to ProfileGate
  const isProfileLocked = !user.profileComplete;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
        {/* Sidebar with mobile state */}
        <Sidebar 
          role={user.role} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header user={user} onMenuClick={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <Routes>
              {isProfileLocked ? (
                <>
                  <Route path="/profile" element={<ProfileGate user={user} onComplete={() => setUser({...user, profileComplete: true})} />} />
                  <Route path="*" element={<Navigate to="/profile" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Dashboard user={user} />} />
                  <Route path="/courses" element={<Dashboard user={user} />} />
                  <Route path="/course/:id" element={<CourseDetail />} />
                  <Route path="/kb/:courseId/:kbId" element={<KBView />} />
                  <Route path="/grades" element={<ComingSoon title="Nilai & Statistik" icon="fa-chart-line" />} />
                  <Route path="/calendar" element={<ComingSoon title="Jadwal Pacing" icon="fa-calendar-days" />} />
                  <Route path="/monitoring" element={<ComingSoon title="Monitoring Siswa" icon="fa-desktop" />} />
                  <Route path="/profile" element={<ProfileGate user={user} onComplete={() => {}} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
