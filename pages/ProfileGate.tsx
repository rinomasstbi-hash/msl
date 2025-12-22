
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileGateProps {
  user: User;
  onComplete: () => void;
}

const ProfileGate: React.FC<ProfileGateProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    nisn: '',
    address: '',
    parentName: '',
    phone: '',
    agreed: false
  });

  const isFormValid = formData.nisn && formData.address && formData.parentName && formData.phone && formData.agreed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full mb-4">
          <i className="fa-solid fa-user-shield text-4xl"></i>
        </div>
        <h1 className="text-2xl font-black text-slate-800">Verifikasi Profil Santri</h1>
        <p className="text-slate-500 mt-2">Sesuai aturan MTsN 4 Jombang, lengkapi data berikut sebelum memulai pembelajaran.</p>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
        <div className="flex items-start">
          <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-1 mr-3"></i>
          <div>
            <h4 className="font-bold text-amber-800">Peringatan Profil Terkunci</h4>
            <p className="text-sm text-amber-700">Menu pembelajaran tidak akan muncul sampai data NISN dan Pakta Integritas divalidasi oleh sistem.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
            <input type="text" value={user.name} disabled className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-400 font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">NISN (10 Digit)</label>
            <input 
              type="text" 
              maxLength={10}
              value={formData.nisn}
              onChange={(e) => setFormData({...formData, nisn: e.target.value})}
              placeholder="00xxxxxxx" 
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Alamat Lengkap di Jombang</label>
          <textarea 
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Dusun..., Desa..., Kec. Jombang"
          ></textarea>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-4">
           <h4 className="font-bold text-slate-800 flex items-center">
             <i className="fa-solid fa-file-signature mr-2 text-emerald-600"></i>
             Pakta Integritas Belajar
           </h4>
           <div className="text-sm text-slate-600 space-y-2 max-h-32 overflow-y-auto custom-scrollbar p-2">
             <p>1. Saya bersedia mengikuti seluruh alur pembelajaran secara linear dan tertib.</p>
             <p>2. Saya tidak akan melakukan plagiasi (Copy-Paste) dalam pembuatan Resume.</p>
             <p>3. Saya akan menjaga etika dalam forum diskusi dengan guru dan teman sejawat.</p>
             <p>4. Saya menyadari bahwa sistem mencatat setiap durasi aktivitas belajar saya.</p>
           </div>
           <label className="flex items-center space-x-3 cursor-pointer group">
             <input 
              type="checkbox" 
              checked={formData.agreed}
              onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
              className="w-5 h-5 accent-emerald-600" 
             />
             <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 transition-colors">Saya setuju dan siap menaati tata tertib di atas.</span>
           </label>
        </div>

        <button 
          disabled={!isFormValid}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 ${
            isFormValid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Buka Akses Pembelajaran</span>
          <i className="fa-solid fa-unlock-keyhole"></i>
        </button>
      </form>
    </div>
  );
};

export default ProfileGate;
