
import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';

interface CoursesPageProps {
  courses: Course[];
}

const CoursesPage: React.FC<CoursesPageProps> = ({ courses }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-slate-800">Mata Pelajaran</h1>
          <p className="text-slate-500 mt-1">Pilih mata pelajaran yang ingin Anda pelajari di Fase D.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {courses.map(course => (
            <Link 
              key={course.id} 
              to={`/course/${course.id}`}
              className="group block p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <i className="fa-solid fa-flask-vial text-xl"></i>
              </div>
              <h4 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-700">{course.name}</h4>
              <p className="text-xs text-slate-500 mb-4">Ust. Muhammad Ali, M.Pd</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                  <span>Progress Belajar</span>
                  <span>1 / {course.modules.length} UKBM</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/3 rounded-full transition-all duration-1000"></div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                 <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">LINEAR PATH</span>
                 <i className="fa-solid fa-arrow-right text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
