
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course } from '../types';

interface CourseDetailProps {
  courses: Course[];
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courses }) => {
  const { id } = useParams<{ id: string }>();
  const course = courses.find(c => c.id === id);
  
  // State for Accordion
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (course && course.modules.length > 0) {
        // Find the first module that is NOT completely finished (Summative not done)
        const activeModule = course.modules.find(m => !m.summativeSubmitted);
        // If all done, show the last one, else show the active one
        if (activeModule) {
            setExpandedModuleId(activeModule.id);
        } else {
            // If all modules are finished, show the last one so it looks "full".
            setExpandedModuleId(course.modules[course.modules.length - 1].id);
        }
    }
  }, [course]);

  const toggleModule = (moduleId: string) => {
    setExpandedModuleId(prev => prev === moduleId ? null : moduleId);
  };

  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
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
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total UKBM</p>
            <p className="text-sm font-bold text-emerald-600">{course.modules.length} Modul</p>
          </div>
          <i className="fa-solid fa-layer-group text-emerald-500"></i>
        </div>
      </div>

      <div className="space-y-4">
        {course.modules.map((mod, modIdx) => {
          const isExpanded = expandedModuleId === mod.id;
          
          return (
          <div key={mod.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${isExpanded ? 'border-emerald-200 ring-4 ring-emerald-50/50' : 'border-slate-200'}`}>
            {/* Header / Toggle Area */}
            <div 
                onClick={() => toggleModule(mod.id)}
                className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${isExpanded ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                  {modIdx + 1}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isExpanded ? 'text-emerald-900' : 'text-slate-700'}`}>UKBM {modIdx + 1}: {mod.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                     {/* Progress Indicator in Header */}
                     {mod.summativeSubmitted ? (
                         <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center">
                            <i className="fa-solid fa-check-circle mr-1"></i> Tuntas
                         </span>
                     ) : (
                         <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex items-center">
                            <i className="fa-solid fa-clock mr-1"></i> Berlangsung
                         </span>
                     )}
                     <span className="text-xs text-slate-400">
                        {mod.kbs.length} KB • Tes Akhir
                     </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                  {/* Diagnostic Button in Header (Always visible if needed) */}
                  {!mod.diagnosticSubmitted && (
                    <Link 
                      to={`/test/diagnostik/${course.id}/${mod.id}`}
                      onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking button
                      className="hidden sm:inline-flex bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors items-center space-x-2 animate-pulse"
                    >
                      <i className="fa-solid fa-clipboard-question"></i>
                      <span>Asesmen Diagnostik</span>
                    </Link>
                  )}
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-emerald-200 text-emerald-700 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                     <i className="fa-solid fa-chevron-down"></i>
                  </div>
              </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-300">
                   {/* Diagnostic Alert if not done */}
                   {!mod.diagnosticSubmitted && (
                       <div className="p-6 bg-amber-50 border-b border-amber-100 text-center sm:hidden">
                            <Link 
                                to={`/test/diagnostik/${course.id}/${mod.id}`}
                                className="inline-flex bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md items-center space-x-2"
                            >
                                <i className="fa-solid fa-clipboard-question"></i>
                                <span>Mulai Asesmen Diagnostik</span>
                            </Link>
                            <p className="text-xs text-amber-800 mt-2">Wajib dikerjakan untuk membuka materi.</p>
                       </div>
                   )}

                  <div className="p-0">
                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100"></div>

                        {mod.kbs.map((kb, kbIdx) => {
                        const isLocked = !mod.diagnosticSubmitted || (kbIdx > 0 && !mod.kbs[kbIdx - 1].isCompleted);
                        
                        return (
                            <div key={kb.id} className={`relative flex items-center p-6 pl-20 ${isLocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
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
                        
                        {/* Tugas Node */}
                        {(() => {
                            const allKbsDone = mod.kbs.every(k => k.isCompleted);
                            const isTugasLocked = !allKbsDone;
                            
                            return (
                            <div className={`relative flex items-center p-6 pl-20 border-t border-slate-100 ${isTugasLocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                <div className={`absolute left-8 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${mod.tugasSubmitted ? 'bg-purple-600' : isTugasLocked ? 'bg-slate-300' : 'bg-purple-400'}`}></div>
                                
                                <div className="flex-1 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-0.5">HOTS Analysis</p>
                                        <h4 className="font-bold text-slate-800">Tugas Terstruktur & Analisis</h4>
                                        <p className="text-xs text-slate-500 mt-1">Analisis hubungan materi & benang merah (HOTS)</p>
                                    </div>
                                    
                                    {mod.tugasSubmitted ? (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100">
                                                <i className="fa-solid fa-check-circle"></i>
                                                <span className="text-xs font-bold">Analisis Terkirim</span>
                                            </div>
                                            {/* Review Button Added */}
                                            <Link 
                                                to={`/tugas/${course.id}/${mod.id}`}
                                                className="bg-white text-purple-600 border border-purple-200 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-50 transition-colors"
                                            >
                                                Review
                                            </Link>
                                        </div>
                                    ) : (
                                        <Link 
                                            to={`/tugas/${course.id}/${mod.id}`}
                                            className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-purple-700 transition-all flex items-center space-x-2"
                                        >
                                            <span>Mulai Analisis</span>
                                            <i className="fa-solid fa-pen-nib"></i>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            )
                        })()}

                        {/* Sumatif Node */}
                        {(() => {
                            const allKbsDone = mod.kbs.every(k => k.isCompleted);
                            const isSumatifLocked = !mod.tugasSubmitted; 
                            
                            return (
                                <div className={`relative flex items-center p-6 pl-20 border-t border-slate-100 ${isSumatifLocked ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                                <div className={`absolute left-8 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${
                                    mod.summativeSubmitted 
                                    ? 'bg-indigo-600'
                                    : !isSumatifLocked ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'
                                }`}></div>
                                
                                <div className="flex-1 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase mb-0.5">Evaluation</p>
                                        <h4 className="font-bold text-slate-800">Tes Sumatif UKBM</h4>
                                        {isSumatifLocked && !allKbsDone && <p className="text-xs text-red-400 italic">Selesaikan semua KB & Tugas dahulu.</p>}
                                    </div>
                                    
                                    {mod.summativeSubmitted ? (
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right hidden sm:block">
                                                    <span className="text-xs font-bold text-slate-400 uppercase block">Nilai Kamu</span>
                                                    <span className={`text-lg font-black ${mod.summativeScore < 84 ? 'text-red-500' : 'text-indigo-700'}`}>
                                                        {mod.summativeScore}/100
                                                        {mod.isRemedial && <span className="text-xs text-slate-400 ml-1 font-normal">(Remedial)</span>}
                                                    </span>
                                                </div>
                                                <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 border border-indigo-200">
                                                        <i className="fa-solid fa-star"></i>
                                                        <span>Selesai</span>
                                                </div>
                                            </div>
                                            {mod.summativeScore < 84 && (
                                                <Link 
                                                    to={`/test/sumatif/${course.id}/${mod.id}`}
                                                    className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 underline"
                                                >
                                                    <i className="fa-solid fa-rotate-left mr-1"></i>
                                                    Nilai dibawah KKTP. Ikuti Remedial?
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <Link 
                                        to={`/test/sumatif/${course.id}/${mod.id}`}
                                        className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all"
                                        >
                                        Mulai Ujian
                                        </Link>
                                    )}
                                </div>
                                </div>
                            );
                        })()}
                    </div>
                  </div>
                </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseDetail;
