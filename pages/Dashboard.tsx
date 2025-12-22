
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, Course } from '../types';

interface DashboardProps {
  user: User;
  courses: Course[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, courses }) => {
  // 1. Calculate Real Statistics
  const stats = useMemo(() => {
    let totalKBs = 0;
    let completedKBs = 0;
    let totalTimeSeconds = 0; // Based on estimated time of COMPLETED kbs

    courses.forEach(c => {
      c.modules.forEach(m => {
        m.kbs.forEach(k => {
          totalKBs++;
          if (k.isCompleted) {
            completedKBs++;
            totalTimeSeconds += k.estimatedTime;
          }
        });
      });
    });

    const completionPercentage = totalKBs === 0 ? 0 : Math.round((completedKBs / totalKBs) * 100);
    const timeSpentHours = (totalTimeSeconds / 3600).toFixed(1);

    return {
      activeCourses: courses.length,
      completion: completionPercentage,
      timeSpentHours
    };
  }, [courses]);

  // 2. Find "Next Step" (Logic for Linear Path)
  // Finds the first course -> first module -> first KB that is NOT completed.
  const nextStep = useMemo(() => {
    for (const course of courses) {
      for (const module of course.modules) {
        // Check Diagnostic First
        if (!module.diagnosticSubmitted) {
            return {
                type: 'diagnostic',
                title: `Asesmen Diagnostik: ${module.title}`,
                subtitle: course.name,
                link: `/test/diagnostik/${course.id}/${module.id}`,
                icon: 'fa-clipboard-question',
                color: 'text-amber-600',
                bg: 'bg-amber-100'
            };
        }

        // Check KBs
        for (const kb of module.kbs) {
            if (!kb.isCompleted) {
                return {
                    type: 'kb',
                    title: kb.title,
                    subtitle: `UKBM: ${module.title}`,
                    link: `/kb/${course.id}/${kb.id}`,
                    icon: 'fa-book-open',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-100'
                };
            }
        }

        // Check Summative
        if (!module.summativeSubmitted) {
             return {
                type: 'summative',
                title: `Tes Sumatif: ${module.title}`,
                subtitle: 'Selesaikan UKBM ini',
                link: `/test/sumatif/${course.id}/${module.id}`,
                icon: 'fa-pen-to-square',
                color: 'text-indigo-600',
                bg: 'bg-indigo-100'
            };
        }
      }
    }
    return null; // All done
  }, [courses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section with Dynamic Next Step */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Ahlan wa Sahlan, {user.name}!</h1>
          <p className="text-slate-500 mt-1">
            {nextStep 
              ? "Mari lanjutkan pembelajaran linear Anda sesuai kurikulum." 
              : "Luar biasa! Anda telah menyelesaikan semua materi yang tersedia saat ini."}
          </p>
          
          <div className="mt-6">
             {nextStep ? (
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-emerald-400 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${nextStep.bg} ${nextStep.color}`}>
                            <i className={`fa-solid ${nextStep.icon} text-xl`}></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lanjutkan Belajar</p>
                            <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{nextStep.title}</h3>
                            <p className="text-xs text-slate-500">{nextStep.subtitle}</p>
                        </div>
                    </div>
                    <Link to={nextStep.link} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition-all">
                        Mulai <i className="fa-solid fa-arrow-right ml-1"></i>
                    </Link>
                 </div>
             ) : (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center space-x-3 text-emerald-800">
                    <i className="fa-solid fa-check-circle text-2xl"></i>
                    <span className="font-bold">Semua tugas tuntas! Istirahatlah sejenak.</span>
                </div>
             )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="w-full md:w-1/3 grid grid-cols-1 gap-4">
             <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 rounded-2xl text-white shadow-lg flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-3xl font-bold">{stats.activeCourses}</p>
                        <p className="text-xs text-emerald-100 font-medium opacity-80 uppercase tracking-wider">Mapel Aktif</p>
                    </div>
                    <i className="fa-solid fa-shapes text-3xl opacity-30"></i>
                </div>
                <div className="mt-2 text-xs bg-emerald-700/50 inline-block px-2 py-1 rounded w-max">
                   Fase D - Semester III
                </div>
             </div>
             
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Total Progress</p>
                    <p className="text-2xl font-black text-slate-800">{stats.completion}%</p>
                </div>
                 <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                    <i className="fa-solid fa-chart-pie text-emerald-500"></i>
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                            className="text-emerald-500"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray={`${stats.completion}, 100`}
                        />
                    </svg>
                 </div>
             </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                <i className="fa-solid fa-clock-rotate-left mr-2 text-amber-500"></i>
                Log Aktivitas Belajar
            </h3>
            <div className="space-y-4">
                 {/* This would ideally come from an activity log array, using calculation for now */}
                 <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                             <i className="fa-solid fa-book-open text-xs"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700">Estimasi Waktu Belajar</p>
                            <p className="text-xs text-slate-400">Akumulasi penyelesaian KB</p>
                        </div>
                    </div>
                    <span className="text-sm font-black text-slate-800">{stats.timeSpentHours} Jam</span>
                 </div>
                 
                 <div className="bg-blue-50 p-3 rounded-lg flex items-start space-x-3">
                    <i className="fa-solid fa-circle-info text-blue-500 mt-0.5"></i>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Sistem mencatat durasi belajar Anda secara otomatis. Pastikan menyelesaikan KB hingga tuntas agar waktu tercatat.
                    </p>
                 </div>
            </div>
         </div>

         <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-sm text-white relative overflow-hidden">
            <i className="fa-solid fa-award absolute -right-6 -bottom-6 text-9xl text-white opacity-5"></i>
            <h3 className="font-bold text-lg mb-1">Peringkat Kelas</h3>
            <p className="text-slate-400 text-sm mb-6">Minggu ke-4 Oktober 2023</p>
            
            <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl font-black text-amber-400">#--</div>
                <div className="flex-1">
                    <p className="font-bold text-sm">Peringkat Belum Tersedia</p>
                    <p className="text-xs text-slate-400">Selesaikan lebih banyak ujian sumatif untuk masuk leaderboard.</p>
                </div>
            </div>
            
            <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors">
                Lihat Leaderboard Lengkap
            </button>
         </div>
      </section>
    </div>
  );
};

export default Dashboard;
