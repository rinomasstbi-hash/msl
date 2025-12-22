
import React, { useMemo } from 'react';
import { Course } from '../types';
import { GRADE_WEIGHTS } from '../services/seedData';

interface GradesPageProps {
  courses: Course[];
}

const GradesPage: React.FC<GradesPageProps> = ({ courses }) => {
  const processedData = useMemo(() => {
    return courses.map(course => {
      const modules = course.modules.map(mod => {
        // Logic to simulate component scores based on completion
        // In a real app, these would be stored in DB. 
        // Here we derive them from 'isCompleted' and 'summativeScore'.
        
        const kbCount = mod.kbs.length;
        const completedKbCount = mod.kbs.filter(k => k.isCompleted).length;
        const progress = kbCount === 0 ? 0 : completedKbCount / kbCount;

        // Mock scores calculation based on progress (since we don't store individual task scores yet)
        // If progress > 0 (started), we give base scores for demo purposes.
        // In production, these come from specific DB fields.
        const resumeScore = progress > 0 ? 88 : 0; 
        const tugasScore = progress > 0 ? 92 : 0;
        const keaktifanScore = progress > 0 ? 95 : 0;
        const sumatifScore = mod.summativeScore || 0;

        // Only calculate final score if summative is done, otherwise it's incomplete
        const finalScore = 
            (resumeScore * GRADE_WEIGHTS.resume) +
            (tugasScore * GRADE_WEIGHTS.tugas) +
            (keaktifanScore * GRADE_WEIGHTS.keaktifan) +
            (sumatifScore * GRADE_WEIGHTS.sumatif);

        return {
          ...mod,
          scores: {
            resume: resumeScore,
            tugas: tugasScore,
            keaktifan: keaktifanScore,
            sumatif: sumatifScore,
            final: Math.round(finalScore)
          }
        };
      });

      const validModules = modules.filter(m => m.summativeSubmitted);
      const totalScore = validModules.reduce((acc, m) => acc + m.scores.final, 0);
      const courseAvg = validModules.length > 0 ? totalScore / validModules.length : 0;

      return {
        ...course,
        modules,
        courseAvg: Math.round(courseAvg)
      };
    });
  }, [courses]);

  // Calculate overall GPA
  const totalAvg = processedData.reduce((acc, c) => acc + c.courseAvg, 0);
  const activeCoursesCount = processedData.filter(c => c.courseAvg > 0).length;
  const gpa = activeCoursesCount > 0 ? (totalAvg / activeCoursesCount).toFixed(1) : "0.0";

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800">Nilai & Statistik</h1>
                <p className="text-slate-500 mt-1">Pantau perkembangan akademik dan pencapaian kompetensi Anda.</p>
            </div>
            <div className="flex gap-4">
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-rata Nilai</p>
                    <p className="text-3xl font-black text-emerald-600">
                        {gpa}
                    </p>
                </div>
                 <div className="w-px h-12 bg-slate-200"></div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UKBM Tuntas</p>
                    <p className="text-3xl font-black text-slate-700">
                        {courses.reduce((acc, c) => acc + c.modules.filter(m => m.summativeSubmitted).length, 0)}
                        <span className="text-sm text-slate-400 font-medium ml-1">/ {courses.reduce((acc, c) => acc + c.modules.length, 0)}</span>
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {processedData.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{course.name}</h3>
                                <p className="text-xs text-slate-500">KKTP: 75 • 2 SKS</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl font-black text-lg ${course.courseAvg >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {course.courseAvg > 0 ? course.courseAvg : '-'}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4 font-bold">UKBM</th>
                                        <th className="p-4 font-bold text-center">Resume ({GRADE_WEIGHTS.resume * 100}%)</th>
                                        <th className="p-4 font-bold text-center">Tugas ({GRADE_WEIGHTS.tugas * 100}%)</th>
                                        <th className="p-4 font-bold text-center">Aktif ({GRADE_WEIGHTS.keaktifan * 100}%)</th>
                                        <th className="p-4 font-bold text-center">Sumatif ({GRADE_WEIGHTS.sumatif * 100}%)</th>
                                        <th className="p-4 font-bold text-center">NA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {course.modules.map(mod => (
                                        <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-700">
                                                {mod.title}
                                                {!mod.summativeSubmitted && <span className="ml-2 text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">On Progress</span>}
                                            </td>
                                            <td className="p-4 text-center text-slate-500">{mod.scores.resume || '-'}</td>
                                            <td className="p-4 text-center text-slate-500">{mod.scores.tugas || '-'}</td>
                                            <td className="p-4 text-center text-slate-500">{mod.scores.keaktifan || '-'}</td>
                                            <td className="p-4 text-center font-bold text-indigo-600">{mod.summativeSubmitted ? mod.scores.sumatif : '-'}</td>
                                            <td className="p-4 text-center">
                                                {mod.summativeSubmitted ? (
                                                    <span className={`font-black ${mod.scores.final >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                        {mod.scores.final}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-bold">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                    <h4 className="font-bold text-slate-800 mb-4">Komposisi Penilaian</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center">
                                <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
                                Resume Materi
                            </span>
                            <span className="font-bold text-slate-700">{GRADE_WEIGHTS.resume * 100}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center">
                                <span className="w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
                                Tugas Terstruktur
                            </span>
                            <span className="font-bold text-slate-700">{GRADE_WEIGHTS.tugas * 100}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center">
                                <span className="w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                                Keaktifan / Sikap
                            </span>
                            <span className="font-bold text-slate-700">{GRADE_WEIGHTS.keaktifan * 100}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 flex items-center">
                                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                                Tes Sumatif
                            </span>
                            <span className="font-bold text-slate-700">{GRADE_WEIGHTS.sumatif * 100}%</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            <i className="fa-solid fa-circle-info mr-1"></i>
                            Nilai Akhir (NA) dihitung otomatis oleh sistem. Pastikan seluruh komponen (KB, Resume, Ujian) terpenuhi agar nilai maksimal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
};

export default GradesPage;
