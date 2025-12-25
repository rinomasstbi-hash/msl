
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
const TEST_DURATION_SECONDS = 60 * 60; // 60 Menit Durasi Total
const MIN_TIME_SECONDS = 15; // Batas minimal 15 detik untuk uji coba

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
  // State untuk Ragu-ragu
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Security States
  const [violationCount, setViolationCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);

  // Mobile Nav State
  const [showMobileGrid, setShowMobileGrid] = useState(false);

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
      setFlaggedQuestions(Array(processedQuestions.length).fill(false)); // Init flagged array
      setTestStarted(true);
      setViolationCount(0);
      setTimeLeft(TEST_DURATION_SECONDS);
      setElapsedTime(0);
      enterFullscreen();
  };

  const handleStartRemedial = () => {
      if (courseId && moduleId) {
          if (currentRemedialCount >= MAX_REMEDIAL_ATTEMPTS) {
              return;
          }
          // Reset status to allow retake
          setIsSubmitting(false); 
          onStartRemedial(courseId, moduleId);
          
          // PENTING: Jangan langsung initializeTest().
          // Set testStarted ke false agar user melihat halaman instruksi/peringatan lagi.
          setTestStarted(false);
          setQuestions([]); // Clear previous questions
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

  // --- TIMER & AUTO SUBMIT LOGIC ---
  useEffect(() => {
    if (!testStarted || isSubmitting || module.summativeSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Waktu Ujian Habis! Jawaban Anda akan dikirim secara otomatis.");
          forceSubmit();
          return 0;
        }
        return prev - 1;
      });

      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, isSubmitting, module.summativeSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
                             <p className="text-red-700 font-medium mb-4">Nilai Anda dibawah Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).</p>
                             <div className="flex flex-col sm:flex-row justify-center gap-3">
                                 <Link 
                                    to={`/course/${courseId}`}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center"
                                 >
                                    <i className="fa-solid fa-arrow-left mr-2"></i>
                                    Kembali
                                 </Link>
                                 <button 
                                    onClick={handleStartRemedial}
                                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center"
                                 >
                                    <span>Ikuti Remedial Sekarang</span>
                                    <i className="fa-solid fa-arrow-right ml-2"></i>
                                 </button>
                             </div>
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
    // If answered, remove flag
    if (flaggedQuestions[currentQuestionIndex]) {
        const newFlags = [...flaggedQuestions];
        newFlags[currentQuestionIndex] = false;
        setFlaggedQuestions(newFlags);
    }
  };

  const handleToggleFlag = () => {
    const newFlags = [...flaggedQuestions];
    newFlags[currentQuestionIndex] = !newFlags[currentQuestionIndex];
    setFlaggedQuestions(newFlags);
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
      // Logic Check Minimum Time
      if (elapsedTime < MIN_TIME_SECONDS) {
          alert(`Anda belum memenuhi batas waktu minimum pengerjaan (${MIN_TIME_SECONDS} detik). Mohon periksa kembali jawaban Anda.`);
          return;
      }
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
  const isMinimumTimeMet = elapsedTime >= MIN_TIME_SECONDS;

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
              <li>Waktu pengerjaan maksimal <strong>{Math.floor(TEST_DURATION_SECONDS / 60)} Menit</strong>.</li>
              <li>Batas waktu minimum submit <strong>{MIN_TIME_SECONDS} Detik</strong>.</li>
              <li>Sistem akan mendeteksi pelanggaran. <strong>3x Pelanggaran = Auto Submit.</strong></li>
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
     <div ref={testContainerRef} className="w-full h-screen flex flex-col p-2 md:p-4 select-none bg-slate-100 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      
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
      
      {isSubmitting && (
           <div className="fixed inset-0 bg-white/90 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
              <i className="fa-solid fa-circle-notch fa-spin text-5xl text-indigo-600 mb-4"></i>
              <p className="font-bold text-slate-700">Mengenkripsi & Mengirim Jawaban...</p>
           </div>
        )}

      {showConfirmModal && (
           <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
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

      {/* Mobile Grid Overlay Backdrop */}
      {showMobileGrid && (
        <div className="fixed inset-0 bg-black/50 z-[50] lg:hidden" onClick={() => setShowMobileGrid(false)}></div>
      )}

      {/* Main Layout: Flex for Sidebar */}
      <div className="flex flex-col lg:flex-row gap-4 h-full max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* Left Column: Question Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden h-full relative">
            <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* Header Info */}
                <div className="mb-4 md:mb-6">
                    <div className="flex justify-between items-center mb-2 md:mb-4">
                        <div className="flex items-center space-x-3">
                            <span className="hidden md:inline text-xs font-bold text-slate-500 uppercase tracking-wider">Soal No.</span>
                            <span className="text-2xl md:text-3xl font-black text-indigo-600">{currentQuestionIndex + 1}</span>
                            <span className="text-lg text-slate-300">/</span>
                            <span className="text-lg text-slate-400 font-bold">{questions.length}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                             {/* Mobile Toggle Grid Button */}
                             <button 
                                onClick={() => setShowMobileGrid(true)}
                                className="lg:hidden px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                             >
                                <i className="fa-solid fa-table-cells mr-1"></i>
                                <span className="text-xs font-bold">Daftar Soal</span>
                             </button>

                             {/* Timer Display */}
                             <div className={`px-3 py-1.5 rounded-lg font-mono font-bold border flex items-center shadow-sm ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                <i className="fa-solid fa-clock mr-2 text-xs"></i>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Violation Badges */}
                    <div className="flex items-center space-x-2">
                         <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                            <i className="fa-solid fa-circle-exclamation mr-1"></i>
                            Pelanggaran: {violationCount}/{MAX_VIOLATIONS}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            {module.isRemedial ? 'Mode Remedial' : 'Mode Sumatif'}
                        </span>
                    </div>
                </div>

                {/* Question Text */}
                <div className="py-4 md:py-6 border-t border-slate-100 min-h-[100px]">
                    <p className="text-base md:text-lg font-medium text-slate-800 leading-relaxed select-none">
                        {currentQuestion.q}
                    </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mt-4 pb-4">
                    {currentQuestion.o.map((option, index) => (
                        <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all flex items-start space-x-3 md:space-x-4 group select-none ${
                            answers[currentQuestionIndex] === index
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-800 shadow-md ring-1 ring-indigo-200'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                        >
                        <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-xs md:text-sm transition-colors mt-0.5 ${
                            answers[currentQuestionIndex] === index ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-slate-400 group-hover:border-indigo-300'
                        }`}>
                            {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-medium text-sm md:text-base leading-snug">{option}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer Navigation Controls */}
            <div className="p-3 md:p-6 bg-slate-50 border-t border-slate-200 flex gap-3 justify-between items-center shrink-0">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm text-sm"
                >
                    <i className="fa-solid fa-chevron-left md:mr-2"></i>
                    <span className="hidden md:inline">Sebelumnya</span>
                </button>

                <button
                    onClick={handleToggleFlag}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all shadow-sm border text-sm ${
                        flaggedQuestions[currentQuestionIndex] 
                        ? 'bg-amber-100 text-amber-700 border-amber-300' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-amber-50 hover:text-amber-600'
                    }`}
                >
                    <i className={`fa-solid ${flaggedQuestions[currentQuestionIndex] ? 'fa-flag' : 'fa-regular fa-flag'} md:mr-2`}></i>
                    <span className="hidden md:inline">Ragu-ragu</span>
                </button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={handleInitSubmit}
                        disabled={!isAllAnswered || !isMinimumTimeMet}
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 text-sm flex items-center justify-center"
                    >
                        <span>Kirim</span>
                        <i className="fa-solid fa-paper-plane ml-2"></i>
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        disabled={answers[currentQuestionIndex] === -1 && !flaggedQuestions[currentQuestionIndex]} 
                        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-indigo-200 text-sm"
                    >
                        <span className="hidden md:inline">Selanjutnya</span>
                        <i className="fa-solid fa-chevron-right md:ml-2"></i>
                    </button>
                )}
            </div>
        </div>

        {/* Right Column: Navigation Grid Sidebar */}
        <div className={`
            bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden transition-all
            lg:w-80 lg:h-auto lg:max-h-full lg:static
            ${showMobileGrid 
                ? 'fixed inset-4 bottom-auto z-[60] h-auto max-h-[80vh] shadow-2xl ring-4 ring-indigo-500/20' 
                : 'hidden lg:flex'}
        `}>
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="font-bold text-slate-700 flex items-center">
                    <i className="fa-solid fa-grip mr-2 text-indigo-500"></i>
                    Navigasi Soal
                </h3>
                <button 
                    onClick={() => setShowMobileGrid(false)}
                    className="lg:hidden w-8 h-8 flex items-center justify-center bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 min-h-[200px] lg:min-h-0">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, idx) => {
                        const isCurrent = idx === currentQuestionIndex;
                        const isAnswered = answers[idx] !== -1;
                        const isFlagged = flaggedQuestions[idx];

                        // Logic Warna
                        let bgClass = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50";
                        if (isFlagged) {
                            bgClass = "bg-amber-300 border-amber-400 text-amber-900";
                        } else if (isAnswered) {
                            bgClass = "bg-blue-600 border-blue-600 text-white";
                        }

                        // Logic Border/Ring Active
                        const activeClass = isCurrent ? "ring-2 ring-indigo-500 ring-offset-2 z-10" : "";

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    setCurrentQuestionIndex(idx);
                                    setShowMobileGrid(false); // Close modal on mobile select
                                }}
                                className={`h-10 w-full rounded-lg text-sm font-bold border transition-all shadow-sm flex items-center justify-center ${bgClass} ${activeClass}`}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] space-y-2 shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-blue-600 border border-blue-600"></div>
                    <span className="text-slate-500 font-bold">Sudah Dijawab</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-amber-300 border border-amber-400"></div>
                    <span className="text-slate-500 font-bold">Ragu-ragu</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-white border border-slate-300"></div>
                    <span className="text-slate-500 font-bold">Belum Dijawab</span>
                </div>
                
                {!isMinimumTimeMet && (
                    <div className="pt-2 mt-2 border-t border-slate-200">
                        <p className="text-red-500 font-bold text-center">
                             Submit dalam: {MIN_TIME_SECONDS - elapsedTime}s
                        </p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default SummativeTest;
