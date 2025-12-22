
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Course } from '../types';

interface DashboardProps {
  user: User;
  courses: Course[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, courses }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-2xl text-white shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <i className="fa-solid fa-book-open-reader text-3xl opacity-50"></i>
            <span className="bg-emerald-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest">Active Course</span>
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-sm text-emerald-100 mt-1">Mata Pelajaran Aktif</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <i className="fa-solid fa-check-double text-3xl text-blue-500"></i>
            <span className="bg-blue-50 px-2 py-1 rounded text-[10px] uppercase font-bold text-blue-600">Completion</span>
          </div>
          <p className="text-3xl font-bold">85%</p>
          <p className="text-sm text-slate-500 mt-1">Rata-rata Progress KB</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <i className="fa-solid fa-clock-rotate-left text-3xl text-amber-500"></i>
            <span className="bg-amber-50 px-2 py-1 rounded text-[10px] uppercase font-bold text-amber-600">Time spent</span>
          </div>
          <p className="text-3xl font-bold">4.2h</p>
          <p className="text-sm text-slate-500 mt-1">Waktu Belajar Minggu Ini</p>
        </div>
      </section>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Daftar Mata Pelajaran (Fase D)</h3>
          <button className="text-emerald-600 text-sm font-semibold hover:underline">Lihat Semua</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {courses.map(course => (
            <Link 
              key={course.id} 
              to={`/course/${course.id}`}
              className="group block p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <i className="fa-solid fa-flask-vial text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-700">{course.name}</h4>
              <p className="text-xs text-slate-500 mb-4">Ust. Muhammad Ali, M.Pd</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>Progress Belajar</span>
                  <span>1 / {course.modules.length} Bab</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/3 rounded-full transition-all duration-1000"></div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                 <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">LINEAR PATH</span>
                 <i className="fa-solid fa-arrow-right text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;