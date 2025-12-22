
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Course } from '../types';

interface AssignmentUploadProps {
  courses: Course[];
  onSubmitAssignment: (courseId: string, moduleId: string, fileName: string) => void;
}

const AssignmentUpload: React.FC<AssignmentUploadProps> = ({ courses, onSubmitAssignment }) => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  if (!course || !module) return <div>Data tidak ditemukan.</div>;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    // Simulate Upload Delay
    setTimeout(() => {
       if (courseId && moduleId) {
           onSubmitAssignment(courseId, moduleId, file.name);
           alert("Tugas berhasil dikumpulkan!");
           navigate(`/course/${courseId}`);
       }
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-file-arrow-up text-3xl"></i>
        </div>
        
        <h1 className="text-2xl font-black text-slate-800">Tugas Terstruktur</h1>
        <p className="text-slate-500 mt-1">{module.title}</p>
        
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl mt-6">
            <h3 className="font-bold text-slate-700 mb-2">Instruksi Tugas:</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
                Silakan kerjakan LKS halaman 15-20 bagian B. Foto hasil pengerjaan Anda atau scan dalam format PDF/JPG. Pastikan tulisan terbaca dengan jelas.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                {file ? (
                    <div>
                        <i className="fa-solid fa-file-check text-4xl text-emerald-500 mb-2"></i>
                        <p className="font-bold text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-400">Klik untuk mengganti file</p>
                    </div>
                ) : (
                    <div>
                        <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-300 mb-2"></i>
                        <p className="font-bold text-slate-600">Klik untuk upload file</p>
                        <p className="text-xs text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                )}
            </div>

            <div className="flex space-x-4">
                <Link to={`/course/${courseId}`} className="flex-1 py-3 text-center bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    Batal
                </Link>
                <button 
                    type="submit" 
                    disabled={!file || isUploading}
                    className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors flex items-center justify-center space-x-2 ${!file || isUploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                    {isUploading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <span>Mengupload...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-paper-plane"></i>
                            <span>Kumpulkan Tugas</span>
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentUpload;
