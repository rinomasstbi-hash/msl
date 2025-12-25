
import React, { useMemo } from 'react';
import { Course, UserRole, User } from '../types';
import { Link } from 'react-router-dom';
import { MOCK_AUTH_USERS } from '../services/seedData';

interface TeacherMonitoringProps {
  courses: Course[];
  userRole: UserRole;
  currentUser: User;
}

const TeacherMonitoring: React.FC<TeacherMonitoringProps> = ({ courses, userRole, currentUser }) => {
  
  // 1. FILTERING LOGIC: Ambil hanya siswa yang sesuai dengan kelas Guru (misal: VIII-R)
  const filteredStudents = useMemo(() => {
    // Jika Super Admin / Supervisor, lihat semua.
    // Jika Guru, hanya lihat siswa yang kelasnya sama dengan `currentUser.className`
    const allStudents = MOCK_AUTH_USERS.filter(u => u.role === UserRole.STUDENT);
    
    if (userRole === UserRole.TEACHER && currentUser.className) {
        return allStudents.filter(student => student.className === currentUser.className);
    }
    
    return allStudents;
  }, [userRole, currentUser]);

  // Statistik Real
  const activeStudentsCount = filteredStudents.length; // Simulasi aktif semua
  const totalStudentsCount = filteredStudents.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h1 className="text-2xl font-black text-slate-800">Monitoring Siswa</h1>
            <p className="text-slate-500 mt-1">
                {userRole === UserRole.TEACHER 
                    ? `Memantau Kelas Binaan: ${currentUser.className || 'Semua Kelas'}` 
                    : "Pantau aktivitas seluruh siswa."}
            </p>
         </div>
         <div className="flex gap-4">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</p>
                <p className="text-3xl font-black text-indigo-600">{totalStudentsCount}</p>
             </div>
             <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
             <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktif Hari Ini</p>
                <p className="text-3xl font-black text-emerald-600">{activeStudentsCount}</p>
             </div>
         </div>
      </div>

      {/* Filter Bar - Dinamis berdasarkan kelas yang tersedia di hasil filter */}
      <div className="flex gap-4 overflow-x-auto pb-2">
         <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-bold">
            <option>Semua Kelas</option>
            {currentUser.className && <option>{currentUser.className}</option>}
         </select>
         <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fa-solid fa-search text-slate-400"></i>
            </div>
            <input type="text" className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5" placeholder="Cari nama siswa..." />
         </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
         {filteredStudents.length > 0 ? (
             <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">Nama Siswa</th>
                        <th className="px-6 py-4">Kelas</th>
                        <th className="px-6 py-4">NISN</th>
                        <th className="px-6 py-4">Status Profil</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map((student) => (
                        <tr key={student.id} className="bg-white border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800 flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                    <img src={student.avatar} alt="av" className="w-full h-full object-cover" />
                                </div>
                                <span>{student.name}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold text-xs">
                                    {student.className}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-slate-500">{student.nisn || '-'}</td>
                            <td className="px-6 py-4">
                                {student.profileComplete ? (
                                    <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                        <i className="fa-solid fa-check-circle mr-1"></i> Lengkap
                                    </span>
                                ) : (
                                    <span className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                                        <i className="fa-solid fa-triangle-exclamation mr-1"></i> Belum
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-indigo-600 hover:text-indigo-900 font-bold hover:underline text-xs">
                                    Lihat Rapor
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
         ) : (
             <div className="p-10 text-center">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <i className="fa-solid fa-user-slash text-2xl"></i>
                 </div>
                 <h3 className="font-bold text-slate-600">Tidak ada siswa ditemukan</h3>
                 <p className="text-sm text-slate-400 mt-1">Belum ada siswa yang terdaftar di kelas {currentUser.className}.</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default TeacherMonitoring;
