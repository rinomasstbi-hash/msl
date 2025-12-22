
import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose, disabled = false }) => {
  const links = [
    { to: '/', icon: 'fa-house', label: 'Dashboard' },
    { to: '/courses', icon: 'fa-book-open', label: 'Mata Pelajaran' },
    { to: '/grades', icon: 'fa-chart-line', label: 'Nilai & Statistik' },
    { to: '/calendar', icon: 'fa-calendar-days', label: 'Jadwal Pacing' },
  ];

  if (role === UserRole.TEACHER || role === UserRole.SUPERVISOR) {
    links.push({ to: '/monitoring', icon: 'fa-desktop', label: 'Monitoring Siswa' });
  }

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-emerald-900 text-white flex flex-col transition-transform duration-300 ease-in-out
    lg:static lg:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    ${disabled ? 'grayscale opacity-70 pointer-events-none' : ''}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="p-6 border-b border-emerald-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-900">
            <i className="fa-solid fa-graduation-cap text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">MSL</h1>
            <p className="text-xs text-emerald-300">MTsN 4 Jombang</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-emerald-300 hover:text-white">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-950/20' : 'text-emerald-100 hover:bg-emerald-800'
              }`
            }
          >
            <i className={`fa-solid ${link.icon} w-5`}></i>
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <div className="bg-emerald-800 p-4 rounded-xl">
          <p className="text-[10px] font-bold text-emerald-400 mb-1 uppercase tracking-widest">Status Sistem</p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${disabled ? 'bg-slate-400' : 'bg-green-400 animate-pulse'}`}></div>
            <span className="text-sm font-semibold">{disabled ? 'Arsip Mode' : 'Online & Linear'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
