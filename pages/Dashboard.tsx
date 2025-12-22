
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang, {user.name}!</h1>
        <p className="text-slate-500 mt-1">Siap untuk melanjutkan pembelajaran hari ini?</p>
        <Link to="/courses" className="mt-4 inline-block px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all">
          <i className="fa-solid fa-arrow-right mr-2"></i>
          Lihat Mata Pelajaran
        </Link>
      </div>

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
    </div>
  );
};

export default Dashboard;