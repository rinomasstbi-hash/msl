
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Course, KKTP } from '../types';
import { MOCK_SUMMATIVE_QUESTIONS } from '../services/seedData';

interface SummativeTestProps {
  courses: Course[];
  onCompleteSummative: (courseId: string, moduleId: string, score: number, isRemedial: boolean) => Promise<void> | void;
  onStartRemedial: (courseId: string, moduleId: string) => void;
}

// Tipe untuk Soal yang sudah diacak
interface ShuffledQuestion {
    originalIndex: number;
    q: string;
    o: string[];
    a: number; // Index jawaban benar yang baru setelah diacak
}

const MAX_VIOLATIONS = 3;

const SummativeTest: React.FC<SummativeTestProps> = ({ courses, onCompleteSummative, onStartRemedial }) => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const testContainerRef = useRef<HTMLDivElement>(null);
  
  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  const [testStarted, setTestStarted] = useState(false);
  
  // State untuk Soal yang sudah diacak
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Security States
  const [violationCount, setViolationCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  if (!course || !module) {
    return <div>Ujian tidak ditemukan.</div>;
  }

  // --- REMEDIAL LOGIC CONFIG ---
  const MAX_REMEDIAL_ATTEMPTS = 2;
  const currentRemedialCount = module.remedialAttemptCount || 0;

  // --- RANDOMIZATION ENGINE ---
  const initializeTest = () => {
      // 1. Deep Copy Questions
      const rawQuestions = JSON.parse(JSON.stringify(MOCK_SUMMATIVE_QUESTIONS));
      
      // 2. Shuffle Options within each question & Adjust Correct Answer Index
      const processedQuestions = rawQuestions.map((q: any, idx: number) => {
          const correctOptionText = q.o[q.a]; // Simpan teks jawaban benar
          
          // Fisher-Yates Shuffle for Options
          for (let i = q.o.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [q.o[i], q.o[j]] = [q.o[j], q.o[i]];
          }

          // Find new index of the correct answer
          const newCorrectIndex = q.o.indexOf(correctOptionText);
          
          return {
              originalIndex: idx,
              q: q.q,
              o: q.o,
              a: newCorrectIndex
          };
      });

      // 3. Shuffle the Questions Order
      for (let i = processedQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [processedQuestions[i], processedQuestions[j]] = [processedQuestions[j], processedQuestions[i]];
      }

      setQuestions(processedQuestions);
      setAnswers(Array(processedQuestions.length).fill(-1));
      setTestStarted(true);
      setViolationCount(0);
      enterFullscreen();
  };

  const handleStartRemedial = () => {
      if (courseId && moduleId) {
          if (currentRemedialCount >= MAX_REMEDIAL_ATTEMPTS) {
              return;
          }
          setIsSubmitting(false); 
          onStartRemedial(courseId, moduleId);
          // Re-init randomization
          initializeTest();
          setCurrentQuestionIndex(0);
      }
  }

  // --- SECURITY LOGIC ---
  const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
          elem.requestFullscreen().catch((err) => console.log(err));
      }
      setIsFullscreen(true);
  };

  const handleViolation = useCallback((reason: string) => {
      if (isSubmitting || module.summativeSubmitted) return;

      setViolationCount(prev => {
          const newCount = prev + 1;
          setSecurityMessage(`PELANGGARAN TERDETEKSI (${newCount}/${MAX_VIOLATIONS}): ${reason}`);
          
          // Auto close warning after 3s
          setTimeout(() => setSecurityMessage(null), 4000);

          if (newCount >= MAX_VIOLATIONS) {
              alert("ANDA TERDISKUALIFIKASI. Sistem mendeteksi kecurangan berulang. Ujian akan dikirim otomatis dengan nilai saat ini.");
              forceSubmit();
          }
          return newCount;
      });
  }, [isSubmitting, module.summativeSubmitted]);

  const forceSubmit = () => {
      // Wrapper to call submit logic directly
      handleSubmitLogic(true); 
  };

  // Event Listeners for Security
  useEffect(() => {
      if (!testStarted || module.summativeSubmitted) return;

      const handleVisibilityChange = () => {
          if (document.hidden) {
              handleViolation("Meninggalkan Halaman Ujian (Tab Switch)");
          }
      };

      const handleBlur = () => {
          handleViolation("Kehilangan Fokus Jendela (Membuka Aplikasi Lain)");
      };

      const handleFullscreenChange = () => {
          if (!document.fullscreenElement) {
              handleViolation("Keluar dari Mode Fullscreen");
              setIsFullscreen(false);
          } else {
              setIsFullscreen(true);
          }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
          // Block Inspeksi & Reload
          if (
              e.key === 'F12' || 
              (e.ctrlKey && e.shiftKey && e.key === 'I') ||
              (e.ctrlKey && e.key === 'u') ||
              e.key === 'F5' ||
              (e.ctrlKey && e.key === 'r')
          ) {
              e.preventDefault();
              handleViolation("Percobaan Inspeksi/Reload Halaman");
          }

          // Block Copy Paste
          if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
              e.preventDefault();
              handleViolation("Percobaan Copy-Paste (Clipboard diblokir)");
          }

          // Block Alt+Tab attempt (Blur will catch it, but we try key too)
          if (e.altKey && e.key === 'Tab') {
               e.preventDefault();
          }
      };

      const handleContextMenu = (e: MouseEvent) => {
          e.preventDefault();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("blur", handleBlur);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("contextmenu", handleContextMenu);

      return () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("blur", handleBlur);
          document.removeEventListener("fullscreenchange", handleFullscreenChange);
          document.removeEventListener("keydown", handleKeyDown);
          document.removeEventListener("contextmenu", handleContextMenu);
      };
  }, [testStarted, handleViolation, module.summativeSubmitted]);


  // VIEW: RESULT SCREEN
  if (module.summativeSubmitted) {
     const isBelowKKTP = module.summativeScore < KKTP;
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
                     {currentRemedialCount > 0 && (
                        <div className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold mb-2">
                            Remedial ke-{currentRemedialCount} dari {MAX_REMEDIAL_ATTEMPTS}
                        </div>
                     )}

                     {canRetake ? (
                         <div className="animate-in slide-in-from-bottom-2">
                             <p className="text-red-700 font-medium mb-1">Nilai Anda dibawah Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).</p>
                             <button 
                                onClick={handleStartRemedial}
                                className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                             >
                                Ikuti Remedial Sekarang
                             </button>
                         </div>
                     ) : (
                         <div className="bg-white/60 p-6 rounded-xl border border-red-100 animate-in zoom-in-95">
                            <h3 className="text-slate-800 font-bold mb-2">Kesempatan Remedial Habis</h3>
                            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                                Anda telah menggunakan seluruh kesempatan remedial. Sistem menyimpan nilai tertinggi.
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
    if (currentQuestionIndex < questions.length - 1) {
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

  const handleSubmitLogic = (isForced: boolean = false) => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    // Calculate Score based on SHUFFLED questions and answers
    let correctCount = 0;
    answers.forEach((ans, idx) => {
        // Bandingkan jawaban user (index opsi) dengan index jawaban benar di object soal yg sudah diacak
        if (ans === questions[idx].a) {
            correctCount++;
        }
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    const isRemedialAttempt = !!module.isRemedial; 

    // Exit fullscreen
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }

    setTimeout(async () => {
        if (courseId && moduleId) {
            await onCompleteSummative(courseId, moduleId, finalScore, isRemedialAttempt);
            if (isForced) {
                // Additional logic if needed for forced submit logging
            }
        }
    }, 1500);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isAllAnswered = !answers.includes(-1);

  // VIEW: START SCREEN
  if (!testStarted) {
    return (
      <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500 select-none">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-indigo-100">
            <i className="fa-solid fa-shield-halved text-4xl"></i>
          </div>
          
          <h1 className="text-2xl font-black text-slate-800">Secure Exam Browser</h1>
          <p className="text-lg font-semibold text-emerald-700 mt-1">{module.title}</p>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mt-8 text-left space-y-4 shadow-sm">
            <h4 className="font-bold text-red-800 flex items-center">
              <i className="fa-solid fa-lock mr-2"></i>
              Mode Keamanan Tinggi Diaktifkan
            </h4>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-2">
              <li>Layar akan dipaksa <strong>Fullscreen (Kiosk Mode)</strong>.</li>
              <li>Dilarang <strong>Pindah Tab</strong> atau membuka aplikasi lain.</li>
              <li>Dilarang menggunakan tombol <strong>Copy, Paste, PrintScreen</strong>.</li>
              <li>Klik kanan dan tombol navigasi browser dimatikan.</li>
              <li>Sistem akan mendeteksi pelanggaran. <strong>3x Pelanggaran = Auto Submit.</strong></li>
              <li>Soal dan Opsi jawaban diacak secara otomatis oleh sistem.</li>
            </ul>
          </div>

          <div className="mt-8 space-y-4">
            <button 
              onClick={initializeTest}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
            >
              <i className="fa-solid fa-play"></i>
              <span>{module.isRemedial ? 'Mulai Remedial (Secure)' : 'Mulai Ujian (Secure)'}</span>
            </button>
            <Link 
              to={`/course/${courseId}`}
              className="inline-block text-slate-500 font-semibold text-sm hover:text-emerald-700 transition-colors"
            >
              Batalkan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // VIEW: QUESTION INTERFACE
  return (
     <div ref={testContainerRef} className="max-w-4xl mx-auto animate-in fade-in duration-500 py-6 select-none" onContextMenu={(e) => e.preventDefault()}>
      
      {/* Security Overlay Warning */}
      {securityMessage && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white p-4 text-center font-bold shadow-2xl animate-pulse">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              {securityMessage}
          </div>
      )}

      {/* Fullscreen check overlay (if user escaped manually) */}
      {!isFullscreen && !isSubmitting && (
          <div className="fixed inset-0 bg-slate-900/95 z-[90] flex flex-col items-center justify-center text-white text-center p-8 backdrop-blur-md">
              <i className="fa-solid fa-lock text-6xl mb-4 text-red-500"></i>
              <h2 className="text-3xl font-black mb-2">Ujian Terkunci</h2>
              <p className="mb-8 text-slate-300">Anda keluar dari mode layar penuh. Kembali ke fullscreen untuk melanjutkan.</p>
              <button 
                onClick={enterFullscreen}
                className="px-8 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                  Kembali ke Fullscreen
              </button>
          </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden">
        {isSubmitting && (
           <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
              <i className="fa-solid fa-circle-notch fa-spin text-5xl text-indigo-600 mb-4"></i>
              <p className="font-bold text-slate-700">Mengenkripsi & Mengirim Jawaban...</p>
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
                 Pastikan jawaban Anda benar. Anda tidak dapat mengubahnya setelah dikirim.
               </p>
               <div className="flex space-x-3">
                 <button 
                   onClick={() => setShowConfirmModal(false)}
                   className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={() => handleSubmitLogic(false)}
                   className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                 >
                   Ya, Kirim
                 </button>
               </div>
             </div>
           </div>
        )}

        <div className="mb-6 flex justify-between items-end">
          <div className="flex-1 mr-4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-indigo-700">Soal {currentQuestionIndex + 1} dari {questions.length}</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                        <i className="fa-solid fa-circle-exclamation mr-1"></i>
                        Pelanggaran: {violationCount}/{MAX_VIOLATIONS}
                    </span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        {module.isRemedial ? 'Remedial' : 'Sumatif'}
                    </span>
                </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="py-8 border-y border-slate-100 min-h-[150px]">
          <p className="text-lg font-semibold text-slate-800 leading-relaxed select-none">
              {currentQuestion.q}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {currentQuestion.o.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4 group select-none ${
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
          
          {currentQuestionIndex === questions.length - 1 ? (
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
