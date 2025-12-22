
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { MOCK_SUMMATIVE_QUESTIONS } from '../services/seedData';

interface SummativeTestProps {
  courses: Course[];
  onCompleteSummative: (courseId: string, moduleId: string, score: number) => void;
}

const SummativeTest: React.FC<SummativeTestProps> = ({ courses, onCompleteSummative }) => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  
  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(MOCK_SUMMATIVE_QUESTIONS.length).fill(-1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!course || !module) {
    return <div>Ujian tidak ditemukan.</div>;
  }

  // If already submitted, redirect or show score
  if (module.summativeSubmitted) {
     return (
        <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500">
           <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
             <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6">
                <i className="fa-solid fa-trophy text-4xl"></i>
             </div>
             <h1 className="text-2xl font-black text-slate-800">Ujian Selesai!</h1>
             <p className="text-lg text-slate-600 mt-2">Nilai Anda: <span className="font-bold text-emerald-600 text-2xl">{module.summativeScore}</span></p>
             <Link 
                to={`/course/${courseId}`}
                className="mt-6 inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
             >
                Kembali ke UKBM
             </Link>
           </div>
        </div>
     )
  }

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < MOCK_SUMMATIVE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleInitSubmit = () => {
      setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    // Calculate Score
    let correctCount = 0;
    answers.forEach((ans, idx) => {
        if (ans === MOCK_SUMMATIVE_QUESTIONS[idx].a) {
            correctCount++;
        }
    });
    
    const finalScore = Math.round((correctCount / MOCK_SUMMATIVE_QUESTIONS.length) * 100);

    // Simulate processing delay
    setTimeout(() => {
        if (courseId && moduleId) {
            onCompleteSummative(courseId, moduleId, finalScore);
        }
        navigate(`/course/${courseId}`);
    }, 1500);
  };

  const currentQuestion = MOCK_SUMMATIVE_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MOCK_SUMMATIVE_QUESTIONS.length) * 100;
  const isAllAnswered = !answers.includes(-1);

  if (!testStarted) {
    return (
      <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-indigo-100">
            <i className="fa-solid fa-file-pen text-4xl"></i>
          </div>
          
          <h1 className="text-2xl font-black text-slate-800">Tes Sumatif UKBM</h1>
          <p className="text-lg font-semibold text-emerald-700 mt-1">{module.title}</p>
          <p className="text-sm text-slate-500 mt-2">Mata Pelajaran: {course.name}</p>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mt-8 text-left space-y-4">
            <h4 className="font-bold text-blue-800 text-center">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Peraturan Ujian
            </h4>
            <ul className="text-sm text-blue-700 list-decimal list-inside space-y-2">
              <li>Waktu pengerjaan ujian estimasi <strong>15 Menit</strong>.</li>
              <li>Ujian terdiri dari {MOCK_SUMMATIVE_QUESTIONS.length} Soal Pilihan Ganda.</li>
              <li>Dilarang membuka tab baru atau window lain selama ujian berlangsung.</li>
              <li>Setiap pelanggaran akan dicatat oleh sistem monitoring.</li>
              <li>Pastikan koneksi internet Anda stabil sebelum memulai.</li>
            </ul>
          </div>

          <div className="mt-8 space-y-4">
            <button 
              onClick={() => setTestStarted(true)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all"
            >
              Mulai Ujian Sekarang
            </button>
            <Link 
              to={`/course/${courseId}`}
              className="inline-block text-slate-500 font-semibold text-sm hover:text-emerald-700 transition-colors"
            >
              Kembali ke Detail UKBM
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Test Interface
  return (
     <div className="max-w-3xl mx-auto animate-in fade-in duration-500 py-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
        {isSubmitting && (
           <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
              <i className="fa-solid fa-circle-notch fa-spin text-5xl text-indigo-600 mb-4"></i>
              <p className="font-bold text-slate-700">Menghitung Nilai...</p>
           </div>
        )}

        {showConfirmModal && (
           <div className="absolute inset-0 bg-black/50 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
               </div>
               <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Selesaikan Ujian?</h3>
               <p className="text-center text-slate-600 text-sm mb-6">
                 Pastikan semua jawaban Anda sudah benar. Anda tidak dapat mengubah jawaban setelah dikirim.
               </p>
               <div className="flex space-x-3">
                 <button 
                   onClick={() => setShowConfirmModal(false)}
                   className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={handleConfirmSubmit}
                   className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                 >
                   Ya, Kirim
                 </button>
               </div>
             </div>
           </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-indigo-700">Soal {currentQuestionIndex + 1} dari {MOCK_SUMMATIVE_QUESTIONS.length}</h2>
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Sumatif Mode</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        <div className="py-8 border-y border-slate-100 min-h-[150px]">
          <p className="text-lg font-semibold text-slate-800 leading-relaxed">{currentQuestion.q}</p>
        </div>

        <div className="mt-8 space-y-3">
          {currentQuestion.o.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4 group ${
                answers[currentQuestionIndex] === index
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors ${
                answers[currentQuestionIndex] === index ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-slate-400 group-hover:border-indigo-300'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Sebelumnya
          </button>
          
          {currentQuestionIndex === MOCK_SUMMATIVE_QUESTIONS.length - 1 ? (
            <button
              onClick={handleInitSubmit}
              disabled={!isAllAnswered}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
            >
              Kirim Jawaban
              <i className="fa-solid fa-paper-plane ml-2"></i>
            </button>
          ) : (
             <button
              onClick={handleNext}
              disabled={answers[currentQuestionIndex] === -1}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
            >
              Selanjutnya
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummativeTest;
