
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
import AssignmentUpload from './pages/AssignmentUpload';
import LoginPage from './pages/LoginPage';
import * as api from './services/api';
import { User, Course } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for Semester Dropdown
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      api.initializeData(); // Seed data if it doesn't exist
      
      // Load User Session
      const userData = await api.getUser();
      
      if (userData) {
          const coursesData = await api.getCourses();
          setUser(userData);
          setCourses(coursesData);
          if (userData.semester) {
            setSelectedSemester(userData.semester);
          }
      }
      
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleLoginSuccess = async (loggedInUser: User) => {
      setUser(loggedInUser);
      if (loggedInUser.semester) {
        setSelectedSemester(loggedInUser.semester);
      }
      setIsLoading(true);
      const coursesData = await api.getCourses();
      setCourses(coursesData);
      setIsLoading(false);
  };

  const handleLogout = () => {
      api.clearSession();
      setUser(null);
      setCourses([]);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleCompleteKB = async (courseId: string, kbId: string, resumeContent?: string) => {
    const updatedCourses = await api.updateKBCompletion(courseId, kbId, resumeContent);
    setCourses(updatedCourses);
  };

  const handleResetKB = async (courseId: string, kbId: string) => {
    const updatedCourses = await api.resetKBCompletion(courseId, kbId);
    setCourses(updatedCourses);
  };

  const handleDiagnosticComplete = async (courseId: string, moduleId: string) => {
    const updatedCourses = await api.updateDiagnosticCompletion(courseId, moduleId);
    setCourses(updatedCourses);
  };

  const handleSummativeScore = async (courseId: string, moduleId: string, score: number, isRemedial: boolean = false) => {
    const updatedCourses = await api.updateSummativeScore(courseId, moduleId, score, isRemedial);
    setCourses(updatedCourses);
  };
  
  const handleRemedialStart = async (courseId: string, moduleId: string) => {
     const updatedCourses = await api.resetSummativeForRemedial(courseId, moduleId);
     setCourses(updatedCourses);
  };

  const handleAssignmentSubmit = async (courseId: string, moduleId: string, content: string) => {
    const updatedCourses = await api.updateTugasSubmission(courseId, moduleId, content);
    setCourses(updatedCourses);
  };

  const handleProfileUpdate = async (updatedUser: User) => {
      const savedUser = await api.updateUser(updatedUser);
      setUser(savedUser);
      // Ensure dropdown updates if profile update changed semester
      if (savedUser.semester) {
        setSelectedSemester(savedUser.semester);
      }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-emerald-600"></i>
            <p className="mt-4 font-semibold text-slate-700">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  // --- AUTH CHECK ---
  if (!user) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Logic: Check if the selected semester matches the user's active semester
  const isActiveSemester = user.semester === selectedSemester;
  const isProfileLocked = !user.profileComplete;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
        {/* Sidebar with mobile state - Grayed out if inactive semester */}
        <Sidebar 
          role={user.role} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          disabled={!isActiveSemester}
          onLogout={handleLogout}
        />
        
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header remains active to allow changing semester back */}
          <Header 
            user={user} 
            onMenuClick={toggleSidebar} 
            selectedSemester={selectedSemester}
            onSemesterChange={setSelectedSemester}
          />
          
          {/* Main content area - Applies gray effect if inactive semester */}
          <main className={`flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar transition-all duration-300 ${!isActiveSemester ? 'grayscale opacity-40 pointer-events-none select-none' : ''}`}>
            {!isActiveSemester && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 p-6 rounded-2xl shadow-2xl text-center border-2 border-slate-200">
                        <i className="fa-solid fa-lock text-4xl text-slate-400 mb-4"></i>
                        <h2 className="text-xl font-bold text-slate-800">Arsip Semester</h2>
                        <p className="text-sm text-slate-500 mt-2">Anda sedang melihat data periode yang tidak aktif.<br/>Kembali ke semester aktif untuk melanjutkan belajar.</p>
                    </div>
                </div>
            )}
            
            <Routes>
              {isProfileLocked ? (
                <>
                  <Route path="/profile" element={<ProfileGate user={user} onProfileUpdate={handleProfileUpdate} />} />
                  <Route path="*" element={<Navigate to="/profile" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Dashboard user={user} courses={courses} />} />
                  
                  {/* COMMON ROUTES */}
                  <Route path="/profile" element={<ProfileGate user={user} onProfileUpdate={handleProfileUpdate} />} />

                  {/* STUDENT SPECIFIC ROUTES */}
                  {user.role === 'STUDENT' && (
                    <>
                        <Route path="/courses" element={<CoursesPage courses={courses} />} />
                        <Route path="/course/:id" element={<CourseDetail courses={courses} />} />
                        <Route 
                            path="/kb/:courseId/:kbId" 
                            element={<KBView courses={courses} onCompleteKB={handleCompleteKB} onResetKB={handleResetKB} />} 
                        />
                        <Route 
                            path="/tugas/:courseId/:moduleId" 
                            element={<AssignmentUpload courses={courses} onSubmitAssignment={handleAssignmentSubmit} />} 
                        />
                        <Route 
                            path="/test/sumatif/:courseId/:moduleId" 
                            element={<SummativeTest courses={courses} onCompleteSummative={handleSummativeScore} onStartRemedial={handleRemedialStart} />} 
                        />
                        <Route path="/test/diagnostik/:courseId/:moduleId" element={<DiagnosticTest courses={courses} onCompleteDiagnostic={handleDiagnosticComplete} />} />
                        <Route path="/grades" element={<GradesPage courses={courses} />} />
                        <Route path="/calendar" element={<ComingSoon title="Jadwal Pacing" icon="fa-calendar-days" />} />
                    </>
                  )}

                  {/* TEACHER / SUPERVISOR / ADMIN ROUTES */}
                  {user.role !== 'STUDENT' && (
                    <>
                        <Route path="/monitoring" element={<ComingSoon title="Monitoring Siswa" icon="fa-desktop" />} />
                        <Route path="/content-mgmt" element={<ComingSoon title="Kelola Modul & KB" icon="fa-pen-to-square" />} />
                        <Route path="/grading" element={<ComingSoon title="Input Nilai Manual" icon="fa-marker" />} />
                        <Route path="/teacher-perf" element={<ComingSoon title="Kinerja Guru" icon="fa-user-tie" />} />
                        <Route path="/users" element={<ComingSoon title="Manajemen User" icon="fa-users-gear" />} />
                        <Route path="/settings" element={<ComingSoon title="Pengaturan App" icon="fa-gears" />} />
                    </>
                  )}

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
