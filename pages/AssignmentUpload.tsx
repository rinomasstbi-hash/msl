
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course } from '../types';

interface AssignmentUploadProps {
  courses: Course[];
  onSubmitAssignment: (courseId: string, moduleId: string, content: string) => void;
}

const AssignmentUpload: React.FC<AssignmentUploadProps> = ({ courses, onSubmitAssignment }) => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  useEffect(() => {
      if (module?.tugasContent) {
          setContent(module.tugasContent);
      }
  }, [module]);

  if (!course || !module) return <div>Data tidak ditemukan.</div>;

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    alert("Anti-Cheat: Copy-Paste dinonaktifkan! Tugas ini menuntut analisis kritis dan pemikiran orisinal Anda. Silakan ketik jawaban secara manual.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.length < 200) {
        alert("Analisis terlalu pendek. Mohon berikan elaborasi minimal 200 karakter.");
        return;
    }

    setIsSubmitting(true);
    // Simulate Processing Delay
    setTimeout(() => {
       if (courseId && moduleId) {
           onSubmitAssignment(courseId, moduleId, content);
           alert("Analisis Kritis berhasil dikirim!");
           navigate(`/course/${courseId}`);
       }
    }, 1500);
  };

  const isCompleted = module.tugasSubmitted;

  return (
    <div className="max-w-4xl mx-auto py-10 animate-in fade-in duration-500 pb-24">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                <i className={`fa-solid ${isCompleted ? 'fa-check-double' : 'fa-brain'} text-3xl`}></i>
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800">{isCompleted ? 'Review Jawaban Analisis' : 'Analisis Kritis & Koneksi Materi'}</h1>
                <p className="text-slate-500 font-medium">Tugas Terstruktur HOTS • {module.title}</p>
            </div>
        </div>
        
        {!isCompleted && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl mt-6 mb-8">
                <h3 className="font-bold text-amber-800 mb-2 flex items-center">
                    <i className="fa-solid fa-lightbulb mr-2"></i>
                    Instruksi Pengerjaan (HOTS)
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed">
                    Tugas ini tidak meminta hafalan. Anda diminta untuk <strong>menganalisis, menghubungkan (mencari benang merah), dan menyimpulkan</strong> materi dari seluruh Kegiatan Belajar (KB) yang telah diselesaikan. 
                    <br/><br/>
                    <span className="font-bold text-red-600"><i className="fa-solid fa-ban mr-1"></i> Fitur Copy-Paste dimatikan.</span> Tulislah hasil pemikiran Anda sendiri.
                </p>
            </div>
        )}

        <div className="space-y-6">
             {/* Question Box */}
             <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <i className="fa-solid fa-quote-right absolute top-4 right-4 text-6xl text-white opacity-10"></i>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pertanyaan Analisis</h4>
                <p className="text-lg font-medium leading-relaxed font-serif">
                    "{module.tugasQuestion || 'Jelaskan hubungan antar materi dalam modul ini dan berikan contoh penerapannya dalam kehidupan nyata.'}"
                </p>
             </div>

             {/* Editor Area / Review Area */}
             <form onSubmit={handleSubmit} className="space-y-4">
                {isCompleted ? (
                    <div className="relative">
                        <div className="w-full min-h-[300px] p-8 rounded-xl border border-slate-200 bg-slate-50 font-serif text-slate-700 leading-loose text-lg whitespace-pre-wrap shadow-inner">
                            {content}
                        </div>
                        <div className="absolute top-4 right-4">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center">
                                <i className="fa-solid fa-lock mr-2"></i>
                                Jawaban Terkunci
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onPaste={handlePaste}
                            className="w-full h-96 p-6 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-0 transition-all outline-none resize-none font-medium text-slate-700 leading-loose text-lg"
                            placeholder="Mulai ketik analisis kritis Anda di sini... (Minimal 200 karakter)"
                        ></textarea>
                        
                        <div className="absolute bottom-4 right-4 flex items-center space-x-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${content.length < 200 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {content.length} Karakter
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex space-x-4 pt-4">
                    <Link to={`/course/${courseId}`} className="px-8 py-4 text-center bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        Kembali ke Modul
                    </Link>
                    
                    {!isCompleted && (
                        <button 
                            type="submit" 
                            disabled={content.length < 200 || isSubmitting}
                            className={`flex-1 py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center space-x-2 ${content.length < 200 || isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-[1.01]'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Menyimpan Analisis...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-paper-plane"></i>
                                    <span>Kirim Analisis</span>
                                </>
                            )}
                        </button>
                    )}
                    
                    {isCompleted && (
                         <div className="flex-1 bg-emerald-100 text-emerald-800 py-4 rounded-xl font-bold flex items-center justify-center border border-emerald-200 cursor-default">
                            <i className="fa-solid fa-check-double mr-2"></i>
                            Terkirim pada {new Date().toLocaleDateString('id-ID')}
                        </div>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentUpload;
