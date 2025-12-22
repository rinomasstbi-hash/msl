
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Course } from '../types';

interface SummativeTestProps {
  courses: Course[];
}

const SummativeTest: React.FC<SummativeTestProps> = ({ courses }) => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  
  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  if (!course || !module) {
    return <div>Ujian tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-indigo-100">
          <i className="fa-solid fa-file-pen text-4xl"></i>
        </div>
        
        <h1 className="text-2xl font-black text-slate-800">Tes Sumatif Modul</h1>
        <p className="text-lg font-semibold text-emerald-700 mt-1">{module.title}</p>
        <p className="text-sm text-slate-500 mt-2">Mata Pelajaran: {course.name}</p>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mt-8 text-left space-y-4">
          <h4 className="font-bold text-blue-800 text-center">
            <i className="fa-solid fa-circle-info mr-2"></i>
            Peraturan Ujian
          </h4>
          <ul className="text-sm text-blue-700 list-decimal list-inside space-y-2">
            <li>Waktu pengerjaan ujian adalah <strong>90 Menit</strong>.</li>
            <li>Ujian terdiri dari 20 Soal Pilihan Ganda dan 5 Soal Esai.</li>
            <li>Dilarang membuka tab baru atau window lain selama ujian berlangsung.</li>
            <li>Setiap pelanggaran akan dicatat oleh sistem monitoring.</li>
            <li>Pastikan koneksi internet Anda stabil sebelum memulai.</li>
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          <button 
            onClick={() => alert("Fitur ujian akan segera tersedia!")}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all"
          >
            Mulai Ujian Sekarang
          </button>
          <Link 
            to={`/course/${courseId}`}
            className="inline-block text-slate-500 font-semibold text-sm hover:text-emerald-700 transition-colors"
          >
            Kembali ke Detail Modul
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SummativeTest;