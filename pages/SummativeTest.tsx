
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Course, KKTP } from '../types';
import { MOCK_SUMMATIVE_QUESTIONS } from '../services/seedData';

interface SummativeTestProps {
  courses: Course[];
  onCompleteSummative: (courseId: string, moduleId: string, score: number, isRemedial: boolean) => void;
  onStartRemedial: (courseId: string, moduleId: string) => void;
}

const SummativeTest: React.FC<SummativeTestProps> = ({ courses, onCompleteSummative, onStartRemedial }) => {
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

  // --- REMEDIAL LOGIC CONFIG ---
  const MAX_REMEDIAL_ATTEMPTS = 2;
  const currentRemedialCount = module.remedialAttemptCount || 0;

  const handleStartRemedial = () => {
      if (courseId && moduleId) {
          if (currentRemedialCount >= MAX_REMEDIAL_ATTEMPTS) {
              return; // Guard clause
          }
          setIsSubmitting(false); 
          onStartRemedial(courseId, moduleId);
          // Reset local state for immediate feedback
          setTestStarted(true);
          setAnswers(Array(MOCK_SUMMATIVE_QUESTIONS.length).fill(-1));
          setCurrentQuestionIndex(0);
      }
  }

  // VIEW: RESULT SCREEN (Jika sudah submit)
  if (module.summativeSubmitted) {
     const isBelowKKTP = module.summativeScore < KKTP;
     // Cek apakah masih punya sisa kesempatan (count < 2)
     const canRetake = currentRemedialCount < MAX_REMEDIAL_ATTEMPTS;

     return (
        <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500">
           <div className={`p-8 rounded-2xl shadow-xl border ${isBelowKKTP ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
             <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isBelowKKTP ? 'bg-red-100 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <i className={`fa-solid ${isBelowKKTP ? 'fa-triangle-exclamation' : 'fa-trophy'} text-4xl`}></i>
             </div>
             <h1 className="text-2xl font-black text-slate-800">{isBelowKKTP ? 'Belum Tuntas' : 'Ujian Selesai!'}</h1>
             
             <div className="my-6">
                <p className="text-lg text-slate-600">Nilai Anda:</p>
                <p className={`text-5xl font-black my-2 ${isBelowKKTP ? 'text-red-600' : 'text-emerald-600'}`}>
                    {module.summativeScore}
                </p>
                <p className="text-sm font-bold text-slate-400">KKTP: {KKTP}</p>
             </div>

             {isBelowKKTP ? (
                 <div className="space-y-4">
                     {/* Info Percobaan Remedial */}
                     {currentRemedialCount > 0 && (
                        <div className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold mb-2">
                            Remedial ke-{currentRemedialCount} dari {MAX_REMEDIAL_ATTEMPTS}
                        </div>
                     )}

                     {canRetake ? (
                         <div className="animate-in slide-in-from-bottom-2">
                             <p className="text-red-700 font-medium mb-1">Nilai Anda dibawah Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).</p>
                             <p className="text-xs text-slate-500 mb-4">Catatan: Nilai Remedial maksimal {KKTP}. Sistem akan mengambil nilai terbaik.</p>
                             <button 
                                onClick={handleStartRemedial}
                                className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                             >
                                Ikuti Remedial Sekarang
                             </button>
                         </div>
                     ) : (
                         <div className="bg-white/60 p-6 rounded-xl border border-red-100 animate-in zoom-in-95">
                            <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i className="fa-solid fa-ban text-xl"></i>
                            </div>
                            <h3 className="text-slate-800 font-bold mb-2">Kesempatan Remedial Habis</h3>
                            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                                Anda telah menggunakan seluruh kesempatan remedial ({MAX_REMEDIAL_ATTEMPTS}x). 
                                Sistem telah menyimpan <strong>nilai tertinggi</strong> dari seluruh percobaan Anda sebagai nilai akhir.
                            </p>
                            <Link 
                                to={`/course/${courseId}`}
                                className="inline-block bg-slate-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                            >
                                Kembali ke UKBM
                            </Link>
                         </div>
                     )}
                 </div>
             ) : (
                <Link 
                    to={`/course/${courseId}`}
                    className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                    Kembali ke UKBM
                </Link>
             )}
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
    // Logic: If the module was already flagged as remedial (via startRemedial), this attempt is remedial.
    const isRemedialAttempt = !!module.isRemedial; 

    setTimeout(() => {
        if (courseId && moduleId) {
            onCompleteSummative(courseId, moduleId, finalScore, isRemedialAttempt);
            setIsSubmitting(false);
        }
    }, 1500);
  };

  const currentQuestion = MOCK_SUMMATIVE_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MOCK_SUMMATIVE_QUESTIONS.length) * 100;
  const isAllAnswered = !answers.includes(-1);

  // VIEW: START SCREEN
  if (!testStarted) {
    return (
      <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-indigo-100">
            <i className="fa-solid fa-file-pen text-4xl"></i>
          </div>
          
          <h1 className="text-2xl font-black text-slate-800">{module.isRemedial ? 'Remedial Sumatif' : 'Tes Sumatif UKBM'}</h1>
          <p className="text-lg font-semibold text-emerald-700 mt-1">{module.title}</p>
          <p className="text-sm text-slate-500 mt-2">Mata Pelajaran: {course.name}</p>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mt-8 text-left space-y-4">
            <h4 className="font-bold text-blue-800 text-center">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Peraturan Ujian {module.isRemedial && '(Mode Remedial)'}
            </h4>
            <ul className="text-sm text-blue-700 list-decimal list-inside space-y-2">
              <li>Waktu pengerjaan ujian estimasi <strong>15 Menit</strong>.</li>
              <li>Ujian terdiri dari {MOCK_SUMMATIVE_QUESTIONS.length} Soal Pilihan Ganda.</li>
              <li>Minimal nilai ketuntasan (KKTP) adalah <strong>{KKTP}</strong>.</li>
              {module.isRemedial && (
                  <>
                    <li className="font-bold">Nilai maksimal Remedial adalah {KKTP}.</li>
                    <li>Kesempatan Remedial maksimal <strong>2 kali</strong>.</li>
                  </>
              )}
              <li>Dilarang membuka tab baru atau window lain selama ujian berlangsung.</li>
            </ul>
          </div>

          <div className="mt-8 space-y-4">
            <button 
              onClick={() => setTestStarted(true)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all"
            >
              {module.isRemedial ? 'Mulai Mengerjakan' : 'Mulai Ujian Sekarang'}
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

  // VIEW: QUESTION INTERFACE
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
             <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                {module.isRemedial ? 'Remedial Mode' : 'Sumatif Mode'}
             </span>
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
