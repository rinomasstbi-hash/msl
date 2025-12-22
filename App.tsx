
import React, { useState, useEffect } from 'react';
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
import CoursesPage from './pages/CoursesPage';
import GradesPage from './pages/GradesPage';
import * as api from './services/api';
import { User, Course } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      api.initializeData(); // Seed data if it doesn't exist
      const [userData, coursesData] = await Promise.all([
        api.getUser(),
        api.getCourses(),
      ]);
      setUser(userData);
      setCourses(coursesData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCompleteKB = async (courseId: string, kbId: string) => {
    const updatedCourses = await api.updateKBCompletion(courseId, kbId);
    setCourses(updatedCourses);
  };

  const handleDiagnosticComplete = async (courseId: string, moduleId: string) => {
    const updatedCourses = await api.updateDiagnosticCompletion(courseId, moduleId);
    setCourses(updatedCourses);
  };

  const handleSummativeScore = async (courseId: string, moduleId: string, score: number) => {
    const updatedCourses = await api.updateSummativeScore(courseId, moduleId, score);
    setCourses(updatedCourses);
  };

  const handleProfileUpdate = async (updatedUser: User) => {
      const savedUser = await api.updateUser(updatedUser);
      setUser(savedUser);
  };
  
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-emerald-600"></i>
            <p className="mt-4 font-semibold text-slate-700">Memuat Data Pembelajaran...</p>
        </div>
      </div>
    );
  }

  // Profile Lock Logic
  const isProfileLocked = !user.profileComplete;

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
                  <Route path="/profile" element={<ProfileGate user={user} onProfileUpdate={handleProfileUpdate} />} />
                  <Route path="*" element={<Navigate to="/profile" replace />} />
                </>
              ) : (
                <>
                  {/* Updated Dashboard Route to receive courses */}
                  <Route path="/" element={<Dashboard user={user} courses={courses} />} />
                  <Route path="/courses" element={<CoursesPage courses={courses} />} />
                  <Route path="/course/:id" element={<CourseDetail courses={courses} />} />
                  <Route path="/kb/:courseId/:kbId" element={<KBView courses={courses} onCompleteKB={handleCompleteKB} />} />
                  
                  <Route 
                    path="/test/sumatif/:courseId/:moduleId" 
                    element={<SummativeTest courses={courses} onCompleteSummative={handleSummativeScore} />} 
                  />
                  
                  <Route path="/test/diagnostik/:courseId/:moduleId" element={<DiagnosticTest courses={courses} onCompleteDiagnostic={handleDiagnosticComplete} />} />
                  
                  {/* Updated Grades Route */}
                  <Route path="/grades" element={<GradesPage courses={courses} />} />
                  
                  <Route path="/calendar" element={<ComingSoon title="Jadwal Pacing" icon="fa-calendar-days" />} />
                  <Route path="/monitoring" element={<ComingSoon title="Monitoring Siswa" icon="fa-desktop" />} />
                  <Route path="/profile" element={<ProfileGate user={user} onProfileUpdate={handleProfileUpdate} />} />
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
