
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import { MOCK_DIAGNOSTIC_QUESTIONS } from '../constants';

interface DiagnosticTestProps {
  courses: Course[];
  onCompleteDiagnostic: (courseId: string, moduleId: string) => void;
}

const DiagnosticTest: React.FC<DiagnosticTestProps> = ({ courses, onCompleteDiagnostic }) => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();

  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(MOCK_DIAGNOSTIC_QUESTIONS.length).fill(-1));

  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  if (!course || !module) {
    return <div>Ujian tidak ditemukan.</div>;
  }

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < MOCK_DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitTest = () => {
    // In a real app, this would submit the answers. Here, we just complete it.
    alert("Asesmen Diagnostik Selesai! Anda sekarang dapat memulai materi pembelajaran.");
    onCompleteDiagnostic(courseId, moduleId);
    navigate(`/course/${courseId}`);
  };

  const currentQuestion = MOCK_DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / MOCK_DIAGNOSTIC_QUESTIONS.length) * 100;

  if (!testStarted) {
    return (
      <div className="max-w-3xl mx-auto text-center py-10 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full mx-auto flex items-center justify-center mb-6 border-4 border-amber-100">
            <i className="fa-solid fa-clipboard-question text-4xl"></i>
          </div>
          
          <h1 className="text-2xl font-black text-slate-800">Asesmen Diagnostik</h1>
          <p className="text-lg font-semibold text-emerald-700 mt-1">{module.title}</p>
          <p className="text-sm text-slate-500 mt-2">Mata Pelajaran: {course.name}</p>
  
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mt-8 text-left space-y-4">
            <h4 className="font-bold text-blue-800 text-center">
              <i className="fa-solid fa-circle-info mr-2"></i>
              Petunjuk Asesmen
            </h4>
            <ul className="text-sm text-blue-700 list-decimal list-inside space-y-2">
              <li>Asesmen ini bertujuan untuk mengukur pemahaman awal Anda.</li>
              <li>Tidak ada batasan waktu, jawablah dengan jujur sesuai kemampuan.</li>
              <li>Hasil asesmen tidak mempengaruhi nilai akhir, namun digunakan guru untuk bimbingan.</li>
              <li>Selesaikan asesmen ini untuk membuka materi pembelajaran pertama.</li>
            </ul>
          </div>
  
          <div className="mt-8 space-y-4">
            <button 
              onClick={() => setTestStarted(true)}
              className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-amber-600 transition-all"
            >
              Mulai Asesmen
            </button>
            <Link 
              to={`/course/${courseId}`}
              className="inline-block text-slate-500 font-semibold text-sm hover:text-emerald-700 transition-colors"
            >
              Kembali ke Detail Modul
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Test View
  return (
     <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-emerald-700">Soal {currentQuestionIndex + 1} dari {MOCK_DIAGNOSTIC_QUESTIONS.length}</h2>
             <span className="text-xs font-bold text-slate-400">Asesmen Diagnostik</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        <div className="py-8 border-y border-slate-100">
          <p className="text-lg font-semibold text-slate-800 leading-relaxed">{currentQuestion.q}</p>
        </div>

        <div className="mt-8 space-y-4">
          {currentQuestion.o.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                answers[currentQuestionIndex] === index
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                answers[currentQuestionIndex] === index ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
              }`}>
                {answers[currentQuestionIndex] === index && <i className="fa-solid fa-check text-white text-xs"></i>}
              </div>
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Kembali
          </button>
          
          {currentQuestionIndex === MOCK_DIAGNOSTIC_QUESTIONS.length - 1 ? (
            <button
              onClick={handleSubmitTest}
              disabled={answers.includes(-1)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              Selesaikan Asesmen
              <i className="fa-solid fa-flag-checkered ml-2"></i>
            </button>
          ) : (
             <button
              onClick={handleNext}
              disabled={answers[currentQuestionIndex] === -1}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
            >
              Lanjut
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  )
};

export default DiagnosticTest;