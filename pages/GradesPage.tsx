
import React, { useMemo, useState } from 'react';
import { Course } from '../types';
import { GRADE_WEIGHTS } from '../services/seedData';

interface GradesPageProps {
  courses: Course[];
}

const GradesPage: React.FC<GradesPageProps> = ({ courses }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const processedData = useMemo(() => {
    const data = courses.map(course => {
      const modules = course.modules.map(mod => {
        // Now using REAL data from the module, defaulting to 0 if not set
        const resumeScore = mod.resumeScore || 0; 
        const tugasScore = mod.tugasScore || 0;
        const keaktifanScore = mod.keaktifanScore || 0;
        const sumatifScore = mod.summativeScore || 0;

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

    // Sort alphabetically by course name (A-Z)
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  // Calculate overall GPA
  const totalAvg = processedData.reduce((acc, c) => acc + c.courseAvg, 0);
  const activeCoursesCount = processedData.filter(c => c.courseAvg > 0).length;
  const gpa = activeCoursesCount > 0 ? (totalAvg / activeCoursesCount).toFixed(1) : "0.0";

  // Find currently selected course data
  const activeCourse = processedData.find(c => c.id === selectedCourseId);

  return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header & Global Stats */}
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
                 <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">UKBM Tuntas</p>
                    <p className="text-3xl font-black text-slate-700">
                        {courses.reduce((acc, c) => acc + c.modules.filter(m => m.summativeSubmitted).length, 0)}
                        <span className="text-sm text-slate-400 font-medium ml-1">/ {courses.reduce((acc, c) => acc + c.modules.length, 0)}</span>
                    </p>
                </div>
            </div>
        </div>

        {/* Dropdown Selection (Replaces Grid) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <i className="fa-solid fa-filter mr-2 text-emerald-600"></i>
                Pilih Mata Pelajaran
            </label>
            <div className="relative">
                <select 
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-4 pr-10 font-medium cursor-pointer transition-all hover:bg-slate-100"
                >
                    <option value="" disabled>-- Klik untuk memilih mata pelajaran --</option>
                    {processedData.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name} {course.courseAvg > 0 ? `(Nilai: ${course.courseAvg})` : ''}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <i className="fa-solid fa-chevron-down"></i>
                </div>
            </div>
             <p className="text-xs text-slate-400 mt-2 ml-1">
                Pilih salah satu mata pelajaran di atas untuk melihat rincian nilai UKBM dan grafik.
            </p>
        </div>

        {/* Detail View Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-500">
            {/* Left Column: Detailed Grade Table */}
            <div className="lg:col-span-2 space-y-6">
                {activeCourse ? (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-500" key={activeCourse.id}>
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{activeCourse.name}</h3>
                                <p className="text-xs text-slate-500">KKTP: 75 • 2 SKS • {processedData.find(c => c.id === selectedCourseId)?.name === 'Matematika' ? 'Ust. Muhammad Ali' : 'Guru Mapel'}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Nilai Rapor</span>
                                <span className={`block text-2xl font-black ${activeCourse.courseAvg >= 75 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {activeCourse.courseAvg > 0 ? activeCourse.courseAvg : '-'}
                                </span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4 font-bold min-w-[150px]">UKBM</th>
                                        <th className="p-4 font-bold text-center">Resume<br/><span className="text-[9px] opacity-70">({GRADE_WEIGHTS.resume * 100}%)</span></th>
                                        <th className="p-4 font-bold text-center">Tugas<br/><span className="text-[9px] opacity-70">({GRADE_WEIGHTS.tugas * 100}%)</span></th>
                                        <th className="p-4 font-bold text-center">Aktif<br/><span className="text-[9px] opacity-70">({GRADE_WEIGHTS.keaktifan * 100}%)</span></th>
                                        <th className="p-4 font-bold text-center">Sumatif<br/><span className="text-[9px] opacity-70">({GRADE_WEIGHTS.sumatif * 100}%)</span></th>
                                        <th className="p-4 font-bold text-center">NA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {activeCourse.modules.map(mod => (
                                        <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-700">
                                                <div className="flex flex-col">
                                                    <span>{mod.title}</span>
                                                    {!mod.summativeSubmitted && (
                                                        <span className="mt-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit border border-amber-100">
                                                            <i className="fa-solid fa-spinner fa-spin mr-1"></i> On Progress
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-slate-500">{mod.scores.resume || '-'}</td>
                                            <td className="p-4 text-center text-slate-500">{mod.scores.tugas || '-'}</td>
                                            <td className="p-4 text-center text-slate-500">{mod.scores.keaktifan || '-'}</td>
                                            <td className="p-4 text-center font-bold text-indigo-600">{mod.summativeSubmitted ? mod.scores.sumatif : '-'}</td>
                                            <td className="p-4 text-center">
                                                {mod.summativeSubmitted ? (
                                                    <span className={`font-black text-lg ${mod.scores.final >= 75 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                                        {mod.scores.final}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 font-bold">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {activeCourse.modules.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                                                Belum ada data UKBM untuk mata pelajaran ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center animate-in fade-in">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <i className="fa-solid fa-arrow-turn-up text-2xl animate-bounce"></i>
                        </div>
                        <h3 className="font-bold text-slate-600">Belum ada mata pelajaran dipilih</h3>
                        <p className="text-sm text-slate-400 mt-2 max-w-xs">
                            Silakan pilih mata pelajaran melalui dropdown di atas.
                        </p>
                    </div>
                )}
            </div>

            {/* Right Column: Grading Weights Info */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <i className="fa-solid fa-scale-balanced mr-2 text-emerald-600"></i>
                        Bobot Penilaian
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                Resume Materi
                            </span>
                            <span className="font-bold text-slate-800">{GRADE_WEIGHTS.resume * 100}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                                Tugas Terstruktur
                            </span>
                            <span className="font-bold text-slate-800">{GRADE_WEIGHTS.tugas * 100}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                                Keaktifan / Sikap
                            </span>
                            <span className="font-bold text-slate-800">{GRADE_WEIGHTS.keaktifan * 100}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600 flex items-center">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>
                                Tes Sumatif
                            </span>
                            <span className="font-bold text-slate-800">{GRADE_WEIGHTS.sumatif * 100}%</span>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            <i className="fa-solid fa-circle-info mr-1"></i>
                            Nilai Akhir (NA) dihitung otomatis oleh sistem setiap kali Anda menyelesaikan item penilaian.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
  );
};

export default GradesPage;
