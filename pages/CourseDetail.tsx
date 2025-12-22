
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course } from '../types';

interface CourseDetailProps {
  courses: Course[];
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courses }) => {
  const { id } = useParams<{ id: string }>();
  const course = courses.find(c => c.id === id);

  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center space-x-2 text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
            <Link to="/" className="hover:text-emerald-600">Dashboard</Link>
            <i className="fa-solid fa-chevron-right text-[8px]"></i>
            <span>{course.name}</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-800">{course.name}</h1>
          <p className="text-slate-500">Oleh: <span className="font-semibold text-emerald-700">Ust. Muhammad Ali, M.Pd</span></p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Status Modul</p>
            <p className="text-sm font-bold text-emerald-600">Terbuka (Pacing OK)</p>
          </div>
          <i className="fa-solid fa-circle-check text-emerald-500"></i>
        </div>
      </div>

      <div className="space-y-6">
        {course.modules.map((mod, modIdx) => (
          <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black">
                  {modIdx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Modul {modIdx + 1}: {mod.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-slate-500 flex items-center">
                      <i className="fa-solid fa-calendar mr-1"></i> Tersedia sejak: {new Date(mod.availableAt).toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <i className="fa-solid fa-list-check mr-1"></i> {mod.kbs.length} Kegiatan Belajar
                    </span>
                  </div>
                </div>
              </div>
              
              {!mod.diagnosticSubmitted ? (
                <button className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors flex items-center space-x-2">
                  <i className="fa-solid fa-clipboard-question"></i>
                  <span>Mulai Asesmen Diagnostik</span>
                </button>
              ) : (
                <div className="text-emerald-600 flex items-center space-x-2 font-bold text-sm">
                   <i className="fa-solid fa-circle-check"></i>
                   <span>Diagnostik Selesai</span>
                </div>
              )}
            </div>

            <div className="p-0">
              <div className="relative">
                {/* Vertical Line for Linear Path */}
                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100"></div>

                {mod.kbs.map((kb, kbIdx) => {
                  // Logic: KB is locked if previous KB isn't completed OR diagnostic isn't done
                  const isLocked = !mod.diagnosticSubmitted || (kbIdx > 0 && !mod.kbs[kbIdx - 1].isCompleted);
                  
                  return (
                    <div key={kb.id} className={`relative flex items-center p-6 pl-20 ${isLocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                      {/* Node Indicator */}
                      <div className={`absolute left-8 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${kb.isCompleted ? 'bg-emerald-500' : isLocked ? 'bg-slate-300' : 'bg-amber-400'}`}></div>
                      
                      <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className={`${isLocked ? '' : 'group'}`}>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase mb-0.5">KB {kbIdx + 1}</p>
                          <h4 className="font-bold text-slate-800">{kb.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            <i className="fa-solid fa-clock mr-1"></i> Estimasi: {kb.estimatedTime / 60} Menit
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {isLocked ? (
                             <span className="text-xs font-bold text-slate-400 flex items-center">
                               <i className="fa-solid fa-lock mr-2"></i> Materi Terkunci
                             </span>
                          ) : (
                            <Link 
                              to={`/kb/${course.id}/${kb.id}`} 
                              className={`px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all flex items-center space-x-2 ${
                                kb.isCompleted 
                                  ? 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50' 
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              <span>{kb.isCompleted ? 'Ulas Materi' : 'Buka Materi'}</span>
                              <i className={`fa-solid ${kb.isCompleted ? 'fa-eye' : 'fa-arrow-right-long'}`}></i>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Sumatif Node */}
                <div className={`relative flex items-center p-6 pl-20 border-t border-slate-100 ${!mod.kbs.every(k => k.isCompleted) ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                  <div className={`absolute left-8 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${mod.kbs.every(k => k.isCompleted) ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`}></div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase mb-0.5">Evaluation</p>
                      <h4 className="font-bold text-slate-800">Tes Sumatif Modul</h4>
                    </div>
                    <Link 
                      to={`/test/sumatif/${course.id}/${mod.id}`}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all"
                    >
                       Mulai Ujian
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;