
import React, { useState } from 'react';
import * as api from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await api.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Email atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-emerald-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <i className="fa-solid fa-mosque text-[150px] absolute -right-10 -bottom-10 text-white"></i>
          </div>
          <div className="relative z-10">
            {/* Background putih dihilangkan, ukuran disesuaikan agar proporsional */}
            <div className="w-28 h-28 mx-auto flex items-center justify-center mb-2">
               <img 
                src="https://mtsn4jombang.sch.id/wp-content/uploads/2025/08/cropped-LOGOMTSN4BARU_web.png" 
                alt="Logo MTsN 4 Jombang" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-black text-white tracking-wide">AMANAH</h1>
            {/* Menggunakan font artistic (Dancing Script) dan ukuran lebih besar */}
            <p className="text-emerald-100 text-xl font-artistic mt-1 leading-relaxed px-4 drop-shadow-sm">
              Aplikasi Manajemen Akademik, Nilai <br/> & Akhlak Harian
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Akun</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-slate-400"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="nama@madrasah.sch.id"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-slate-400"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center animate-pulse">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center space-x-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400">
               Lupa password? Hubungi Administrator Madrasah.<br/>
               Versi Aplikasi 1.4 (Stable)
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
