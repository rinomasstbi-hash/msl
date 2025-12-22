
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  selectedSemester: string;
  onSemesterChange: (sem: string) => void;
}

const SEMESTER_OPTIONS = [
  'Semester I',
  'Semester II',
  'Semester III',
  'Semester IV',
  'Semester V',
  'Semester VI',
];

const Header: React.FC<HeaderProps> = ({ user, onMenuClick, selectedSemester, onSemesterChange }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm flex-shrink-0">
      <div className="flex items-center space-x-4">
         <button 
           onClick={onMenuClick}
           className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-emerald-700 transition-colors"
         >
           <i className="fa-solid fa-bars-staggered text-xl"></i>
         </button>
         
         {/* Dropdown Semester Replaces App Title */}
         <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
               <i className="fa-solid fa-calendar-days text-emerald-600"></i>
            </div>
            <select
                value={selectedSemester}
                onChange={(e) => onSemesterChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5 pr-8 cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
            >
                {SEMESTER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <i className="fa-solid fa-chevron-down text-xs text-slate-400"></i>
            </div>
         </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        
        {/* Class Info Box Removed from here */}

        <button className="relative text-slate-500 hover:text-emerald-700 transition-colors hidden sm:block ml-2">
          <i className="fa-solid fa-bell text-xl"></i>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white font-bold">3</span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <Link to="/profile" className="flex items-center space-x-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-emerald-700 transition-colors">{user.name}</p>
            {/* Display Role - Class Name */}
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                {user.role} {user.className && ` - ${user.className}`}
            </p>
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
