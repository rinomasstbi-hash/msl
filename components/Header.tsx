
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../types';

interface HeaderProps {
  user: User;
  onMenuClick: () => void;
  selectedSemester: string;
  onSemesterChange: (sem: string) => void;
  onLogout: () => void;
}

const SEMESTER_OPTIONS = [
  'Semester I',
  'Semester II',
  'Semester III',
  'Semester IV',
  'Semester V',
  'Semester VI',
];

const Header: React.FC<HeaderProps> = ({ user, onMenuClick, selectedSemester, onSemesterChange, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 group cursor-pointer focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-emerald-700 transition-colors">{user.name}</p>
              {/* Display Role - Class Name */}
              <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                  {user.role} {user.className && ` - ${user.className}`}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-full bg-emerald-100 border-2 overflow-hidden shadow-md transition-all ${isDropdownOpen ? 'ring-2 ring-emerald-400 border-emerald-400' : 'border-emerald-500/20 group-hover:ring-2 group-hover:ring-emerald-400'}`}>
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <i className={`fa-solid fa-chevron-down text-xs text-slate-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 origin-top-right z-50">
                <div className="px-4 py-3 border-b border-slate-50 sm:hidden">
                    <p className="text-sm font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role}</p>
                </div>
                
                <Link 
                    to="/profile" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                    <i className="fa-solid fa-user-gear w-6"></i>
                    Profil Saya
                </Link>
                
                <Link 
                    to={user.role === UserRole.SUPER_ADMIN ? "/profile" : "/change-password"}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                    <i className="fa-solid fa-key w-6"></i>
                    Ubah Password
                </Link>

                <div className="border-t border-slate-100 my-1"></div>
                
                <button
                    onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                    <i className="fa-solid fa-right-from-bracket w-6"></i>
                    Keluar
                </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
