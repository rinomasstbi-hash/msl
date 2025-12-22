
import React from 'react';
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
        <button className="relative text-slate-500 hover:text-emerald-700 transition-colors hidden sm:block">
          <i className="fa-solid fa-bell text-xl"></i>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white font-bold">3</span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
            <p className="text-[10px] text-emerald-600 font-black uppercase mt-1">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500/20 overflow-hidden shadow-md">
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
