
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuClick }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm flex-shrink-0">
      <div className="flex items-center">
         <button 
           onClick={onMenuClick}
           className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-emerald-700 transition-colors"
         >
           <i className="fa-solid fa-bars-staggered text-xl"></i>
         </button>
         <div className="ml-2 lg:ml-0 flex flex-col md:hidden">
            <span className="font-bold text-emerald-800 leading-tight">MSL Jombang</span>
         </div>
         
         <div className="hidden md:flex flex-col ml-4 lg:ml-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Madrasah Smart Learning</span>
            <h2 className="font-bold text-slate-800">MTsN 4 Jombang</h2>
         </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        
        {/* Class and Semester Status Display */}
        {(user.className || user.semester) && (
            <div className="hidden lg:flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 space-x-4">
                {user.className && (
                    <div className="text-right border-r border-slate-200 pr-4">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kelas</span>
                        <span className="block text-sm font-bold text-slate-700">{user.className}</span>
                    </div>
                )}
                {user.semester && (
                     <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Semester</span>
                        <span className="block text-sm font-bold text-emerald-600">{user.semester}</span>
                    </div>
                )}
            </div>
        )}

        <button className="relative text-slate-500 hover:text-emerald-700 transition-colors hidden sm:block ml-2">
          <i className="fa-solid fa-bell text-xl"></i>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white font-bold">3</span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <Link to="/profile" className="flex items-center space-x-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-emerald-700 transition-colors">{user.name}</p>
            <p className="text-[10px] text-emerald-600 font-black uppercase mt-1">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500/20 overflow-hidden shadow-md group-hover:ring-2 group-hover:ring-emerald-400 transition-all">
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
