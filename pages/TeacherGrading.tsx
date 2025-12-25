
import React from 'react';
import { Course, User } from '../types';
import { Link } from 'react-router-dom';

interface TeacherGradingProps {
  courses: Course[];
  currentUser: User;
}

const TeacherGrading: React.FC<TeacherGradingProps> = ({ courses, currentUser }) => {
  // Logic to find pending assignments (mocked logic or real filter)
  const myCourses = courses.filter(c => c.teacherId === currentUser.id);
  const sampleCourse = myCourses.length > 0 ? myCourses[0] : null;
  const sampleModule = sampleCourse && sampleCourse.modules.length > 0 ? sampleCourse.modules[0] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
         <h1 className="text-2xl font-black text-slate-800">Input & Validasi Nilai</h1>
         <p className="text-slate-500 mt-1">Periksa jawaban analisis siswa (HOTS) untuk mata pelajaran: <strong>{currentUser.subject}</strong></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Pending Assignments */}
         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50">
                 <h3 className="font-bold text-amber-900 flex items-center">
                    <i className="fa-solid fa-clock-rotate-left mr-2"></i>
                    Menunggu Validasi
                 </h3>
                 <span className="bg-white text-amber-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">3 Tugas Baru</span>
             </div>
             <div className="divide-y divide-slate-100">
                 {[1, 2, 3].map((item) => (
                     <div key={item} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-slate-800">Rina Kartika</span>
                            <span className="text-xs text-slate-400">10 Menit lalu</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">Mengirimkan <strong>Analisis Kritis</strong> pada UKBM <em>Teorema Pythagoras</em>.</p>
                        <div className="flex space-x-3">
                            {sampleCourse && sampleModule ? (
                                <Link 
                                    to={`/tugas/${sampleCourse.id}/${sampleModule.id}`}
                                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                                >
                                    Periksa & Nilai
                                </Link>
                            ) : (
                                <button disabled className="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed">
                                    Periksa & Nilai
                                </button>
                            )}
                            <button className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200">Lihat Jawaban</button>
                        </div>
                     </div>
                 ))}
             </div>
         </div>

         {/* Gradebook Overview */}
         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                 <h3 className="font-bold text-indigo-900 flex items-center">
                    <i className="fa-solid fa-book mr-2"></i>
                    Rekap Nilai
                 </h3>
                 <button className="text-indigo-700 text-xs font-bold hover:underline">Download Excel</button>
             </div>
             <div className="p-6">
                <p className="text-sm text-slate-500 mb-4">Pilih kelas binaan Anda untuk melihat transkrip.</p>
                <div className="space-y-3">
                    {/* HANYA TAMPILKAN KELAS GURU */}
                    {currentUser.className && (
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-300 cursor-pointer transition-colors bg-indigo-50/50">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                                    {currentUser.className.replace('Kelas ', '')}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Kelas {currentUser.className}</h4>
                                    <p className="text-xs text-slate-400">Wali Kelas</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300"></i>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-300 cursor-pointer transition-colors opacity-60">
                         <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold">
                                    8A
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Kelas VIII-A</h4>
                                    <p className="text-xs text-slate-400">Guru Mapel</p>
                                </div>
                            </div>
                         <i className="fa-solid fa-lock text-slate-300"></i>
                    </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default TeacherGrading;
