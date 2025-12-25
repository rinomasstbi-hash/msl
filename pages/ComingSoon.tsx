
import React from 'react';
import { Link } from 'react-router-dom';

interface ComingSoonProps {
  title: string;
  icon: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 border-4 border-emerald-100">
        <i className={`fa-solid ${icon} text-4xl`}></i>
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md text-center mb-8">
        Fitur ini sedang dalam tahap sinkronisasi data kurikulum MTsN 4 Jombang. Silakan cek kembali dalam beberapa saat.
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-lg flex items-center space-x-2"
      >
        <i className="fa-solid fa-arrow-left"></i>
        <span>Kembali ke Dashboard</span>
      </Link>
    </div>
  );
};

export default ComingSoon;
