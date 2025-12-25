
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { MOCK_AUTH_USERS } from '../services/seedData';

interface CoursesPageProps {
  courses: Course[];
}

// Predefined Themes for Cards
const THEMES = [
  {
    name: 'Emerald',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accent: 'text-emerald-700',
    progress: 'bg-emerald-500'
  },
  {
    name: 'Blue',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hoverBorder: 'hover:border-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accent: 'text-blue-700',
    progress: 'bg-blue-500'
  },
  {
    name: 'Violet',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    hoverBorder: 'hover:border-violet-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    accent: 'text-violet-700',
    progress: 'bg-violet-500'
  },
  {
    name: 'Amber',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hoverBorder: 'hover:border-amber-500',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    accent: 'text-amber-700',
    progress: 'bg-amber-500'
  },
  {
    name: 'Rose',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    hoverBorder: 'hover:border-rose-500',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    accent: 'text-rose-700',
    progress: 'bg-rose-500'
  },
  {
    name: 'Cyan',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-500',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    accent: 'text-cyan-700',
    progress: 'bg-cyan-500'
  }
];

const CoursesPage: React.FC<CoursesPageProps> = ({ courses }) => {
  // Sort courses alphabetically by name
  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return '-';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <h1 className="text-3xl font-black text-slate-800">Mata Pelajaran</h1>
          <p className="text-slate-500 mt-2 text-lg">Pilih mata pelajaran untuk melihat materi, tugas, dan ujian yang tersedia.</p>
        </div>
        
        {/* Changed grid to lg:grid-cols-3 for larger cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
          {sortedCourses.map((course, index) => {
            // Cycle through themes
            const theme = THEMES[index % THEMES.length];
            
            // Calculate Progress (Mock logic based on modules completed)
            const totalModules = course.modules.length;
            const completedModules = course.modules.filter(m => m.summativeSubmitted).length;
            const percent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
            
            // Derive dates
            const startDate = course.modules[0]?.availableAt || new Date().toISOString();
            // Mock End Date (e.g., 6 months from start or generic semester end)
            const endDate = '2023-12-20T00:00:00Z'; 

            // GET TEACHER NAME DYNAMICALLY
            const teacher = MOCK_AUTH_USERS.find(u => u.id === course.teacherId);
            const teacherName = teacher ? teacher.name : "Guru Pengampu";

            return (
              <Link 
                key={course.id} 
                to={`/course/${course.id}`}
                className={`group relative flex flex-col justify-between p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${theme.bg} ${theme.border} ${theme.hoverBorder}`}
              >
                {/* Top Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${theme.iconBg} ${theme.iconColor}`}>
                      <i className="fa-solid fa-book-bookmark text-3xl"></i>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/60 ${theme.accent}`}>
                          {course.modules.length} UKBM
                       </span>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="mb-6">
                  <h4 className={`text-2xl font-black text-slate-800 mb-2 leading-tight group-hover:${theme.accent} transition-colors`}>
                    {course.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm font-semibold text-slate-500">
                     <i className="fa-solid fa-user-tie text-xs opacity-70"></i>
                     <span>{teacherName}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-6">
                   <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Progres Belajar</span>
                      <span>{percent}%</span>
                   </div>
                   <div className="w-full bg-white/50 h-3 rounded-full overflow-hidden border border-white/50">
                      <div className={`h-full rounded-full ${theme.progress}`} style={{ width: `${percent}%` }}></div>
                   </div>
                </div>

                {/* Bottom Section: Time Period */}
                <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs">
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Mulai</p>
                        <p className={`font-bold ${theme.accent}`}>
                           <i className="fa-regular fa-calendar mr-1"></i>
                           {formatDate(startDate)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 font-bold uppercase tracking-wide text-[10px]">Batas Akhir</p>
                        <p className="font-bold text-red-500/80">
                           <i className="fa-regular fa-clock mr-1"></i>
                           {formatDate(endDate)}
                        </p>
                    </div>
                </div>

                {/* Hover Indicator */}
                <div className={`absolute top-1/2 right-4 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300`}>
                   <i className={`fa-solid fa-chevron-right text-2xl ${theme.accent}`}></i>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
