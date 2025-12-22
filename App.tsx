
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import KBView from './pages/KBView';
import ProfileGate from './pages/ProfileGate';
import ComingSoon from './pages/ComingSoon';
import SummativeTest from './pages/SummativeTest';
import DiagnosticTest from './pages/DiagnosticTest';
import { MOCK_USER, MOCK_COURSES } from './constants';
import { User, Course } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile Lock Logic: If profile isn't complete, force redirection to ProfileGate
  const isProfileLocked = !user.profileComplete;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCompleteKB = (courseId: string, kbId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            modules: course.modules.map(module => ({
              ...module,
              kbs: module.kbs.map(kb => {
                if (kb.id === kbId) {
                  return { ...kb, isCompleted: true };
                }
                return kb;
              }),
            })),
          };
        }
        return course;
      })
    );
  };

  const handleDiagnosticComplete = (courseId: string, moduleId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course => {
        if (course.id === courseId) {
          return {
            ...course,
            modules: course.modules.map(module => {
              if (module.id === moduleId) {
                return { ...module, diagnosticSubmitted: true };
              }
              return module;
            }),
          };
        }
        return course;
      })
    );
  };

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
                  <Route path="/" element={<Dashboard user={user} courses={courses} />} />
                  <Route path="/courses" element={<Dashboard user={user} courses={courses} />} />
                  <Route path="/course/:id" element={<CourseDetail courses={courses} />} />
                  <Route path="/kb/:courseId/:kbId" element={<KBView courses={courses} onCompleteKB={handleCompleteKB} />} />
                  <Route path="/test/sumatif/:courseId/:moduleId" element={<SummativeTest courses={courses} />} />
                  <Route path="/test/diagnostik/:courseId/:moduleId" element={<DiagnosticTest courses={courses} onCompleteDiagnostic={handleDiagnosticComplete} />} />
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