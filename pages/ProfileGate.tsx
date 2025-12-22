
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import * as api from '../services/api';

interface ProfileGateProps {
  user: User;
  onProfileUpdate: (user: User) => void;
  onLogout?: () => void;
}

const ProfileGate: React.FC<ProfileGateProps> = ({ user, onProfileUpdate, onLogout }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check Role
  const isAdmin = user.role === UserRole.SUPER_ADMIN;

  // Modes: View, EditProfile, ChangePassword
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  
  // Change Password State
  const [passData, setPassData] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [passLoading, setPassLoading] = useState(false);

  // Initialize from Actual User Data
  const [formData, setFormData] = useState({
    // Editable Fields
    email: user.email || '',
    address: user.address || '',
    parentName: user.parentName || '',
    phone: user.parentPhone || '',
    avatar: user.avatar || 'https://picsum.photos/200',
    agreed: user.profileComplete
  });

  // Validasi form: 
  // Jika Admin: Cukup Email yg wajib.
  // Jika Siswa: Semua data wajib.
  const isFormValid = isAdmin 
    ? formData.email && formData.email.includes('@')
    : formData.email && formData.address && formData.parentName && formData.phone && formData.agreed;

  // Deteksi perubahan email
  const isEmailChanged = user.email && formData.email !== user.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      // Create updated User object
      const updatedUser: User = { 
          ...user, 
          profileComplete: true, 
          email: formData.email,
          address: formData.address,
          parentName: formData.parentName,
          parentPhone: formData.phone,
          avatar: formData.avatar
      };

      if (!user.profileComplete) {
        onProfileUpdate(updatedUser);
        navigate('/');
      } else {
        onProfileUpdate(updatedUser);
        alert(isEmailChanged 
            ? "Profil dan Email berhasil diperbarui! Gunakan email baru ini untuk login berikutnya." 
            : "Profil berhasil diperbarui!");
        setIsEditing(false);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (passData.newPass !== passData.confirmPass) {
        alert("Konfirmasi password tidak cocok.");
        return;
    }
    if (passData.newPass.length < 6) {
        alert("Password baru minimal 6 karakter.");
        return;
    }

    setPassLoading(true);
    try {
        const result = await api.changePassword(passData.oldPass, passData.newPass);
        if (result.success) {
            alert("Password berhasil diubah! Silakan login kembali dengan password baru.");
            setIsChangingPassword(false);
            setPassData({ oldPass: '', newPass: '', confirmPass: '' });
            
            // LOGOUT TRIGGER
            if (onLogout) {
                onLogout();
            } else {
                // Fallback
                window.location.reload();
            }
        } else {
            alert(`Gagal: ${result.message}`);
        }
    } catch (error) {
        alert("Terjadi kesalahan sistem.");
    } finally {
        setPassLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Reset to original user data
    setFormData({
      email: user.email || '',
      address: user.address || '',
      parentName: user.parentName || '',
      phone: user.parentPhone || '',
      avatar: user.avatar || 'https://picsum.photos/200',
      agreed: true
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsProcessingImg(true);
        if (!file.type.startsWith('image/')) {
            alert('Mohon upload file gambar (JPG/PNG).');
            setIsProcessingImg(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxSize = 150; 
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                if (ctx) {
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    
                    if (dataUrl.length > 49000) {
                        alert("Ukuran file gambar terlalu besar/kompleks. Mohon gunakan gambar lain.");
                    } else {
                        setFormData(prev => ({ ...prev, avatar: dataUrl }));
                    }
                }
                setIsProcessingImg(false);
            };
            img.onerror = () => {
                alert("Gagal memproses gambar.");
                setIsProcessingImg(false);
            };
            img.src = readerEvent.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
  };

  // --- MODE: GANTI PASSWORD ---
  if (isChangingPassword) {
      return (
        <div className="max-w-md mx-auto space-y-6 py-12 animate-in fade-in duration-300">
           <div className="text-center">
               <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                   <i className="fa-solid fa-lock text-2xl"></i>
               </div>
               <h2 className="text-2xl font-black text-slate-800">Ganti Password</h2>
               <p className="text-slate-500">Amankan akun Anda dengan password baru.</p>
           </div>
           
           <form onSubmit={handlePasswordSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-4">
               <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Password Lama</label>
                   <input 
                      type="password" 
                      required
                      value={passData.oldPass}
                      onChange={(e) => setPassData({...passData, oldPass: e.target.value})}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="••••••••"
                   />
               </div>
               <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Password Baru</label>
                   <input 
                      type="password" 
                      required
                      value={passData.newPass}
                      onChange={(e) => setPassData({...passData, newPass: e.target.value})}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Minimal 6 karakter"
                   />
               </div>
               <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Konfirmasi Password Baru</label>
                   <input 
                      type="password" 
                      required
                      value={passData.confirmPass}
                      onChange={(e) => setPassData({...passData, confirmPass: e.target.value})}
                      className={`w-full p-3 rounded-xl border focus:ring-2 outline-none transition-all ${passData.confirmPass && passData.newPass !== passData.confirmPass ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-emerald-500'}`}
                      placeholder="Ulangi password baru"
                   />
               </div>
               
               <div className="pt-4 flex space-x-3">
                   <button 
                      type="button"
                      onClick={() => {
                          setIsChangingPassword(false);
                          setPassData({ oldPass: '', newPass: '', confirmPass: '' });
                      }}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                   >
                       Batal
                   </button>
                   <button 
                      type="submit"
                      disabled={passLoading}
                      className={`flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center ${passLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                   >
                       {passLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Simpan'}
                   </button>
               </div>
           </form>
        </div>
      )
  }

  // --- VIEW MODE (Read Only) ---
  if (user.profileComplete && !isEditing) {
    // SPECIAL VIEW FOR ADMIN
    if (isAdmin) {
        return (
            <div className="max-w-xl mx-auto space-y-8 py-10 animate-in fade-in duration-500">
                <div className="text-center">
                    <div className="relative inline-block mb-4">
                        <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-emerald-50" />
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white border-2 border-white">
                            <i className="fa-solid fa-user-shield"></i>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">{user.name}</h1>
                    <span className="mt-2 inline-block bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Administrator System</span>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Login</label>
                        <div className="flex items-center space-x-3 mt-1">
                            <i className="fa-solid fa-envelope text-slate-300"></i>
                            <p className="text-slate-700 font-bold text-lg">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-100 pt-6 flex flex-col gap-3">
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="w-full py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                        >
                            <i className="fa-solid fa-lock"></i>
                            <span>Ganti Password</span>
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-lg flex items-center justify-center space-x-2"
                        >
                            <i className="fa-solid fa-pen-to-square"></i>
                            <span>Edit Email & Avatar</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // NORMAL STUDENT VIEW
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-emerald-50" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white border-2 border-white">
              <i className="fa-solid fa-check"></i>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800">{user.name}</h1>
          <span className="mt-2 inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">{user.role}</span>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Informasi Profil</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase">Siswa Aktif</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">NISN</label>
              <p className="text-slate-700 font-semibold mt-1">{user.nisn || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kelas / Semester</label>
              <p className="text-slate-700 font-semibold mt-1">{user.className || '-'} / {user.semester || '-'}</p>
            </div>
             <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
              <p className="text-slate-700 font-semibold mt-1">{user.email || '-'}</p>
            </div>
             <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat</label>
              <p className="text-slate-700 font-semibold mt-1">{user.address || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Wali</label>
              <p className="text-slate-700 font-semibold mt-1">{user.parentName || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. HP Wali</label>
              <p className="text-slate-700 font-semibold mt-1">{user.parentPhone || '-'}</p>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-start space-x-3">
            <i className="fa-solid fa-file-signature text-emerald-600 mt-1"></i>
            <div>
              <h4 className="font-bold text-emerald-800">Pakta Integritas</h4>
              <p className="text-sm text-emerald-700">Anda telah menyetujui pakta integritas belajar.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-6 border-t border-slate-100">
             <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Ubah Password
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg"
            >
              Edit Profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- EDIT MODE (SHARED) ---
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center">
        {/* Avatar Upload UI */}
        <div className="relative inline-block mb-4 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-200 relative">
               {isProcessingImg ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                       <i className="fa-solid fa-spinner fa-spin text-white"></i>
                   </div>
               ) : (
                   <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
               )}
            </div>
            
            <div 
                onClick={handleAvatarClick}
                className={`absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white cursor-pointer transition-opacity ${isEditing ? 'opacity-0 group-hover:opacity-100' : 'hidden'}`}
            >
                <i className="fa-solid fa-camera text-2xl"></i>
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
                disabled={!isEditing}
            />
             {isEditing && (
                 <div onClick={handleAvatarClick} className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 cursor-pointer rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-indigo-700 z-10">
                    <i className="fa-solid fa-pen text-xs"></i>
                </div>
             )}
        </div>

        <h1 className="text-2xl font-black text-slate-800">
            {isEditing 
                ? (isAdmin ? 'Edit Profil Admin' : 'Edit Profil Siswa') 
                : (isAdmin ? 'Profil Administrator' : 'Verifikasi Profil')}
        </h1>
        <p className="text-slate-500 mt-2">
          {isEditing 
            ? 'Klik foto di atas untuk mengganti Avatar.' 
            : (isAdmin ? 'Kelola email dan keamanan akun.' : 'Lengkapi data berikut sebelum memulai pembelajaran.')}
        </p>
      </div>

      {!isEditing && !isAdmin && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
          <div className="flex items-start">
            <i className="fa-solid fa-triangle-exclamation text-amber-500 mt-1 mr-3"></i>
            <div>
              <h4 className="font-bold text-amber-800">Peringatan Profil Terkunci</h4>
              <p className="text-sm text-amber-700">Menu pembelajaran tidak akan muncul sampai data profil divalidasi dan pakta integritas disetujui.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-8">
        
        {/* SECTION 1: DATA AKADEMIK (READ ONLY) - HIDE FOR ADMIN */}
        {!isAdmin && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <i className="fa-solid fa-lock mr-2"></i>
                    Data Akademik (Ditetapkan Admin)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Nama Lengkap</label>
                        <input type="text" value={user.name} disabled className="w-full bg-slate-200 text-slate-500 p-3 rounded-xl border border-slate-300 font-bold cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">NISN</label>
                        <input type="text" value={user.nisn || '0000000000'} disabled className="w-full bg-slate-200 text-slate-500 p-3 rounded-xl border border-slate-300 font-bold cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Kelas</label>
                        <input type="text" value={user.className || '-'} disabled className="w-full bg-slate-200 text-slate-500 p-3 rounded-xl border border-slate-300 font-bold cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Semester</label>
                        <input type="text" value={user.semester || '-'} disabled className="w-full bg-slate-200 text-slate-500 p-3 rounded-xl border border-slate-300 font-bold cursor-not-allowed" />
                    </div>
                </div>
            </div>
        )}

        {/* SECTION 2: DATA KONTAK & PRIBADI (EDITABLE) */}
        <div>
             <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center">
                <i className="fa-solid fa-pen-to-square mr-2"></i>
                Data Akun & Kontak
             </h4>

             {/* ALERT PERUBAHAN EMAIL */}
             {isEmailChanged && (
                 <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 animate-in fade-in">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                        <i className="fa-solid fa-key"></i>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-800">Perhatian: Kredensial Login Berubah</h4>
                        <p className="text-xs text-amber-700 mt-1">
                            Anda mengubah email dari <strong>{user.email}</strong> menjadi <strong>{formData.email}</strong>. 
                            Pastikan email baru ini aktif karena akan digunakan untuk login selanjutnya.
                        </p>
                    </div>
                 </div>
             )}

             <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Alamat Email Login</label>
                    <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="nama@contoh.com" 
                    className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 transition-all outline-none ${isEmailChanged ? 'border-amber-400 bg-amber-50/50 text-amber-900 font-bold' : 'border-slate-200'}`}
                    />
                </div>
                
                {/* HIDE FOR ADMIN */}
                {!isAdmin && (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Alamat Lengkap (Domisili)</label>
                            <textarea 
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Dusun..., Desa..., Kec. Jombang"
                            ></textarea>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nama Orang Tua/Wali</label>
                                <input 
                                    type="text"
                                    value={formData.parentName}
                                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                                    placeholder="Contoh: Budi Santoso" 
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nomor HP Orang Tua/Wali</label>
                                <input 
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="Contoh: 081234567890" 
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                                />
                            </div>
                        </div>
                    </>
                )}
             </div>
        </div>

        {/* SECTION 3: PAKTA INTEGRITAS - HIDE FOR ADMIN */}
        {!isAdmin && (
            <div className="bg-emerald-50 p-4 rounded-xl space-y-4">
            <h4 className="font-bold text-emerald-800 flex items-center">
                <i className="fa-solid fa-file-signature mr-2 text-emerald-600"></i>
                Pakta Integritas Belajar
            </h4>
            <div className="text-sm text-emerald-700 space-y-2 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-white/50 rounded-lg border border-emerald-100">
                <p>1. Saya bersedia mengikuti seluruh alur pembelajaran secara linear dan tertib.</p>
                <p>2. Saya tidak akan melakukan plagiasi (Copy-Paste) dalam pembuatan Resume.</p>
                <p>3. Saya akan menjaga etika dalam forum diskusi dengan guru dan teman sejawat.</p>
                <p>4. Saya menyadari bahwa sistem mencatat setiap durasi aktivitas belajar saya.</p>
                <p>5. Data yang saya isikan di atas adalah benar dan dapat dipertanggungjawabkan.</p>
            </div>
            <label className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-emerald-100 rounded-lg transition-colors">
                <input 
                type="checkbox" 
                checked={formData.agreed}
                onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
                className="w-5 h-5 accent-emerald-600 cursor-pointer" 
                />
                <span className="text-sm font-bold text-emerald-800 group-hover:text-emerald-900">Saya setuju dan siap menaati tata tertib di atas.</span>
            </label>
            </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Admin Change Password Button in Form Mode (Initial Setup or Editing) */}
          {isAdmin && !isEditing && (
             <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="w-full py-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fa-solid fa-lock"></i>
              <span>Ubah Password</span>
            </button>
          )}

          {isEditing && (
             <button
              type="button"
              onClick={handleCancelEdit}
              className="w-full py-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
          )}
          
          <button 
            type="submit"
            disabled={!isFormValid || isProcessingImg}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-2 ${
              isFormValid && !isProcessingImg ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessingImg ? (
                <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Memproses Foto...</span>
                </>
            ) : (
                <>
                    <span>{isEditing ? 'Simpan Perubahan' : 'Simpan'}</span>
                    <i className={`fa-solid ${isEditing ? 'fa-floppy-disk' : 'fa-unlock-keyhole'}`}></i>
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileGate;
