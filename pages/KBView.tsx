
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course } from '../types';

const KB_MIN_TIME = 10; // set to 10 seconds for testing demo, real world would be e.g. 120 (2 mins)

interface KBViewProps {
  courses: Course[];
  onCompleteKB: (courseId: string, kbId: string, resumeContent: string) => void;
  onResetKB: (courseId: string, kbId: string) => void;
}

const KBView: React.FC<KBViewProps> = ({ courses, onCompleteKB, onResetKB }) => {
  const { courseId, kbId } = useParams<{ courseId: string; kbId: string }>();
  const navigate = useNavigate();
  
  const course = courses.find(c => c.id === courseId);
  const kb = course?.modules.flatMap(m => m.kbs).find(k => k.id === kbId);

  const [secondsSpent, setSecondsSpent] = useState(0);
  const [resumeContent, setResumeContent] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'resume' | 'discussion'>('content');
  
  // Load saved content when KB changes
  useEffect(() => {
    if (kb?.resumeContent) {
      setResumeContent(kb.resumeContent);
    } else {
      setResumeContent('');
    }
    // Set timer to max if already completed
    if (kb?.isCompleted) {
       setSecondsSpent(KB_MIN_TIME + 1);
    }
  }, [kb]);

  // Time-on-task tracker
  useEffect(() => {
    // Do not start timer if KB is already completed
    if (kb?.isCompleted) return;

    const timer = setInterval(() => {
      setSecondsSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [kb?.isCompleted]);

  const handleFinish = () => {
    // Save logic
    if (secondsSpent < KB_MIN_TIME && !kb?.isCompleted) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    
    if (!resumeContent.trim() || resumeContent.length < 50) {
      alert("Resume harus minimal 50 karakter!");
      setActiveTab('resume');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call and similarity check
    setTimeout(() => {
      const action = kb?.isCompleted ? "Diperbarui" : "Disimpan";
      alert(`Materi Selesai! Resume Anda telah ${action} dan divalidasi.`);
      if (courseId && kbId) {
        onCompleteKB(courseId, kbId, resumeContent);
      }
      navigate(`/course/${courseId}`);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleReset = () => {
    if (window.confirm("PERINGATAN: Mengulangi materi akan MENGHAPUS resume yang sudah Anda ketik dan mereset timer belajar.\n\nApakah Anda yakin ingin memulai ulang dari nol?")) {
        if (courseId && kbId) {
            onResetKB(courseId, kbId);
            setSecondsSpent(0);
            setResumeContent('');
            setActiveTab('content');
        }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    alert("Anti-Cheat: Dilarang melakukan Copy-Paste! Silakan ketik manual resume Anda untuk Deep Learning.");
  };

  if (!kb) return <div>Materi tidak ditemukan</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Navigation Header */}
      <div className="mb-6 flex items-center justify-between">
         <Link 
            to={`/course/${courseId}`}
            className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 shadow-sm group-hover:border-emerald-300 group-hover:bg-emerald-50 transition-all">
                <i className="fa-solid fa-arrow-left text-slate-400 group-hover:text-emerald-600"></i>
            </div>
            <span>Kembali ke <span className="text-slate-700 group-hover:text-emerald-800">{course?.name}</span></span>
         </Link>
         
         <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
            Linear Learning Mode
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Content & Controls */}
        <div className="flex-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-1 border-b border-slate-100 flex items-center bg-slate-50">
                {['content', 'resume', 'discussion'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'text-emerald-700 bg-white border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    {tab}
                </button>
                ))}
            </div>

            <div className="p-8">
                {activeTab === 'content' && (
                <div className="animate-in fade-in duration-500">
                    <h2 className="text-2xl font-black text-slate-800 mb-6">{kb.title}</h2>
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                    <p>{kb.content}</p>
                    <div className="bg-slate-100 h-64 w-full rounded-2xl flex items-center justify-center text-slate-400 italic">
                        [Video Pembelajaran / PDF Viewer Placeholder]
                    </div>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>
                </div>
                )}

                {activeTab === 'resume' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 flex items-center text-sm">
                        <i className="fa-solid fa-circle-info mr-2"></i> Aturan Smart Resume
                    </h4>
                    <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                        <li>Dilarang menyalin (paste) teks dari sumber lain.</li>
                        <li>Sistem mendeteksi kemiripan kata antar siswa.</li>
                        <li>Resume ini menyumbang 20% dari Nilai Akhir Modul.</li>
                    </ul>
                    </div>

                    <textarea
                    className="w-full h-80 p-6 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 transition-all outline-none resize-none font-medium text-slate-700 leading-relaxed"
                    placeholder="Ketikkan ringkasan materi menggunakan bahasa Anda sendiri di sini..."
                    value={resumeContent}
                    onChange={(e) => setResumeContent(e.target.value)}
                    onPaste={handlePaste}
                    ></textarea>
                    
                    <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">{resumeContent.length} / Minimal 50 Karakter</span>
                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">
                        <i className="fa-solid fa-cloud-arrow-up mr-1"></i> Auto-saved locally
                    </div>
                    </div>
                </div>
                )}

                {activeTab === 'discussion' && (
                <div className="text-center py-20 text-slate-400">
                    <i className="fa-solid fa-comments text-5xl mb-4 opacity-20"></i>
                    <p className="font-bold">Belum ada diskusi di KB ini.</p>
                    <button className="mt-4 text-emerald-600 font-bold text-sm hover:underline">+ Mulai Pertanyaan Baru</button>
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Right Column: Status Card */}
        <div className="lg:w-80">
            <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Status Belajar</h4>
                
                {kb.isCompleted && (
                <div className='text-center py-4 animate-in zoom-in-95'>
                    <div className='w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4'>
                    <i className='fa-solid fa-check-double text-3xl'></i>
                    </div>
                    <h5 className='font-bold text-slate-800'>Materi Selesai</h5>
                    <p className='text-xs text-slate-500 mt-1 mb-6'>Resume tersimpan.</p>
                    
                    <button 
                        onClick={handleReset}
                        className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center justify-center w-full py-2 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <i className="fa-solid fa-rotate-left mr-2"></i>
                        Reset Progress & Resume
                    </button>
                </div>
                )}

                <div className={`space-y-6 ${kb.isCompleted ? 'mt-4 pt-4 border-t border-slate-100' : ''}`}>
                    {!kb.isCompleted && (
                        <>
                        <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Durasi Sesi</span>
                        <span className={`text-sm font-black ${secondsSpent < KB_MIN_TIME ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {Math.floor(secondsSpent / 60)}m {secondsSpent % 60}s
                        </span>
                        </div>

                        <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Min. Waktu Baca</span>
                            <span>{Math.min(100, Math.round((secondsSpent / KB_MIN_TIME) * 100))}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                            className={`h-full transition-all duration-500 rounded-full ${secondsSpent < KB_MIN_TIME ? 'bg-amber-400' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (secondsSpent / KB_MIN_TIME) * 100)}%` }}
                            ></div>
                        </div>
                        </div>
                        </>
                    )}

                    <button
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg ${
                        isSubmitting ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-800 text-white hover:bg-emerald-900 active:scale-95'
                    }`}
                    >
                    {isSubmitting ? (
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                    ) : (
                        <>
                        <span>{kb.isCompleted ? 'Simpan Perubahan' : 'Selesaikan KB Ini'}</span>
                        <i className={`fa-solid ${kb.isCompleted ? 'fa-floppy-disk' : 'fa-check-circle'}`}></i>
                        </>
                    )}
                    </button>

                    {showWarning && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold text-center border border-red-100 animate-bounce">
                        <i className="fa-solid fa-stopwatch mr-1"></i> Anda membaca terlalu cepat! Pahami materi dengan seksama.
                    </div>
                    )}
                </div>
            
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <p className="text-[10px] font-black text-emerald-700 uppercase mb-2">Deep Learning Hint</p>
                <p className="text-xs text-emerald-800 leading-relaxed italic">"Ilmu itu ibarat hewan buruan, dan tulisan (resume) adalah pengikatnya."</p>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default KBView;
