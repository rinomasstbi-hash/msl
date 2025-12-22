
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Course } from '../types';

interface DiagnosticTestProps {
  courses: Course[];
  onCompleteDiagnostic: (courseId: string, moduleId: string) => void;
}

const DiagnosticTest: React.FC<DiagnosticTestProps> = ({ courses, onCompleteDiagnostic }) => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  
  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  if (!course || !module) {
    return <div>Ujian tidak ditemukan.</div>;
  }

  const handleStartTest = () => {
    // In a real app, this would start the test. Here, we simulate completion.
    alert("Asesmen Diagnostik Selesai! Anda sekarang dapat memulai materi pembelajaran.");
    onCompleteDiagnostic(courseId, moduleId);
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-amber-100">
          <i className="fa-solid fa-clipboard-question text-4xl"></i>
        </div>
        
        <h1 className="text-2xl font-black text-slate-800">Asesmen Diagnostik</h1>
        <p className="text-lg font-semibold text-emerald-700 mt-1">{module.title}</p>
        <p className="text-sm text-slate-500 mt-2">Mata Pelajaran: {course.name}</p>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mt-8 text-left space-y-4">
          <h4 className="font-bold text-blue-800 text-center">
            <i className="fa-solid fa-circle-info mr-2"></i>
            Petunjuk Asesmen
          </h4>
          <ul className="text-sm text-blue-700 list-decimal list-inside space-y-2">
            <li>Asesmen ini bertujuan untuk mengukur pemahaman awal Anda.</li>
            <li>Tidak ada batasan waktu, jawablah dengan jujur sesuai kemampuan.</li>
            <li>Hasil asesmen tidak mempengaruhi nilai akhir, namun digunakan guru untuk bimbingan.</li>
            <li>Selesaikan asesmen ini untuk membuka materi pembelajaran pertama.</li>
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          <button 
            onClick={handleStartTest}
            className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-amber-600 transition-all"
          >
            Mulai Asesmen
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

export default DiagnosticTest;