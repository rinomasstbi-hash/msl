
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
          <p className="text-slate-500 mt-1">Pilih mata pelajaran yang ingin Anda pelajari.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {courses.map(course => (
            <Link 
              key={course.id} 
              to={`/course/${course.id}`}
              className="group flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-book-bookmark text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors leading-tight">{course.name}</h4>
                  </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                 <i className="fa-solid fa-chevron-right text-xs"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
