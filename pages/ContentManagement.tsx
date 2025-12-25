
import React, { useMemo, useState } from 'react';
import { Course, User } from '../types';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

interface ContentManagementProps {
  courses: Course[];
  currentUser: User;
  onRefresh?: () => void;
}

const ContentManagement: React.FC<ContentManagementProps> = ({ courses, currentUser, onRefresh }) => {
  
  // States for Creating New UKBM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [formData, setFormData] = useState({
      title: '',
      overview: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Filter courses: Only show courses owned by this teacher
  const myCourses = useMemo(() => {
     if (currentUser.role === 'SUPER_ADMIN') return courses;
     return courses.filter(c => c.teacherId === currentUser.id);
  }, [courses, currentUser]);

  const handleOpenModal = () => {
      // Default to first course if available
      if (myCourses.length > 0) {
          setSelectedCourseId(myCourses[0].id);
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validation Check
      if (!selectedCourseId) {
          alert("Pilih Mata Pelajaran terlebih dahulu.");
          return;
      }
      if (!formData.title || !formData.overview) {
          alert("Mohon lengkapi Judul dan Deskripsi UKBM.");
          return;
      }

      setIsSaving(true);
      try {
          // Call API to create module
          await api.createModule(selectedCourseId, formData.title, formData.overview);
          
          alert("UKBM berhasil dibuat!");
          setIsModalOpen(false);
          setFormData({ title: '', overview: '' });
          
          // Trigger refresh in parent (App)
          if (onRefresh) {
              onRefresh();
          }
      } catch (error) {
          console.error(error);
          alert("Terjadi kesalahan saat menyimpan data lokal.");
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
         <div>
            <h1 className="text-2xl font-black text-slate-800">Kelola UKBM & KB</h1>
            <p className="text-slate-500 mt-1">Mata Pelajaran Anda: <span className="font-bold text-purple-600">{currentUser.subject || 'Semua'}</span></p>
         </div>
         <button 
            onClick={handleOpenModal}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg flex items-center space-x-2"
         >
            <i className="fa-solid fa-plus"></i>
            <span>Buat UKBM Baru</span>
         </button>
      </div>

      {/* Course List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCourses.length > 0 ? myCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                            <i className="fa-solid fa-book-open text-xl"></i>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center">
                                <i className="fa-solid fa-pen"></i>
                            </button>
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{course.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{course.modules.length} UKBM Aktif</p>
                </div>
                <div className="bg-slate-50 p-4">
                     <div className="space-y-3">
                        {course.modules.slice(0, 3).map((mod, idx) => (
                            <div key={mod.id} className="flex items-center justify-between text-sm bg-white p-3 rounded-lg border border-slate-200">
                                <span className="font-semibold text-slate-700 truncate w-2/3">{idx+1}. {mod.title}</span>
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Publik</span>
                            </div>
                        ))}
                        {course.modules.length > 3 && (
                            <p className="text-center text-xs text-slate-500 font-semibold italic">+ {course.modules.length - 3} UKBM lainnya</p>
                        )}
                        {course.modules.length === 0 && (
                            <p className="text-center text-xs text-slate-400 italic">Belum ada UKBM.</p>
                        )}
                     </div>
                     <Link 
                        to={`/course/${course.id}`}
                        className="w-full mt-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200 flex items-center justify-center"
                     >
                        Kelola Detail
                     </Link>
                </div>
            </div>
        )) : (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <i className="fa-solid fa-folder-open text-4xl text-slate-300 mb-4"></i>
                <p className="text-slate-500 font-bold">Belum ada Mata Pelajaran yang Anda kelola.</p>
                <p className="text-sm text-slate-400 mb-4">Pastikan Anda login dengan akun Guru yang valid.</p>
            </div>
        )}
      </div>

      {/* MODAL: CREATE UKBM */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
                      <h3 className="font-bold text-lg"><i className="fa-solid fa-plus-circle mr-2"></i> Tambah UKBM Baru</h3>
                      <button onClick={() => setIsModalOpen(false)} className="hover:text-purple-200"><i className="fa-solid fa-xmark text-xl"></i></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                      {/* Select Course if multiple */}
                      {myCourses.length > 0 ? (
                          <div className="space-y-1">
                              <label className="text-sm font-bold text-slate-700">Pilih Mata Pelajaran</label>
                              <select 
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                              >
                                  {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                          </div>
                      ) : (
                          <div className="bg-red-50 p-3 rounded-lg text-xs text-red-600 font-bold flex flex-col items-start gap-2">
                              <span>Anda tidak memiliki akses sebagai Guru Pengampu mata pelajaran apapun.</span>
                          </div>
                      )}

                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">Judul UKBM</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Contoh: Bangun Ruang Sisi Datar"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
                            disabled={myCourses.length === 0}
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-sm font-bold text-slate-700">Deskripsi / Pertanyaan Pemantik (HOTS)</label>
                          <textarea 
                            required
                            rows={4}
                            placeholder="Tuliskan gambaran umum materi atau pertanyaan analisis kritis untuk siswa..."
                            value={formData.overview}
                            onChange={(e) => setFormData({...formData, overview: e.target.value})}
                            className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            disabled={myCourses.length === 0}
                          ></textarea>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-700">
                          <i className="fa-solid fa-info-circle mr-1"></i>
                          Setelah dibuat, UKBM akan otomatis memiliki <strong>1 Kegiatan Belajar (Pendahuluan)</strong> default. Anda dapat mengedit isinya nanti.
                      </div>

                      <div className="pt-4 flex space-x-3">
                          <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                          >
                              Batal
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSaving || myCourses.length === 0}
                            className={`flex-1 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center space-x-2 ${isSaving || myCourses.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                          >
                              {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                              <span>{isSaving ? 'Menyimpan...' : 'Simpan UKBM'}</span>
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ContentManagement;
