
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPERVISOR = 'SUPERVISOR', // Principal/Waka
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  profileComplete: boolean;
  avatar?: string;
  email: string;
  className?: string; // e.g. "8-A"
  semester?: string;  // e.g. "Ganjil 2024/2025"
  // New fields for Profile Persistence
  nisn?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  learningProgress?: string; // JSON String stored in DB
}

export interface KB {
  id: string;
  title: string;
  order: number;
  content: string;
  estimatedTime: number; // in seconds
  unlockDate?: string;
  isCompleted: boolean;
  resumeContent?: string; // New: Persist user's resume
}

export interface Module {
  id: string;
  title: string;
  subject: string;
  order: number;
  diagnosticSubmitted: boolean;
  
  // Tugas Terstruktur Fields
  tugasSubmitted?: boolean;
  tugasFile?: string; // Mock URL or filename
  
  summativeSubmitted?: boolean; 
  summativeScore?: number;
  isRemedial?: boolean; // New: Flag if the current score is from a remedial attempt
  
  // Weighted scores fields
  resumeScore?: number;
  tugasScore?: number;
  keaktifanScore?: number;

  kbs: KB[];
  availableAt: string;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  modules: Module[];
}

export interface GradeWeights {
  resume: number;
  tugas: number;
  keaktifan: number;
  sumatif: number;
}

export const KKTP = 84; // Standard Minimum Score

export interface StudentActivityLog {
  userId: string;
  action: string;
  kbId: string;
  timestamp: string;
  durationSeconds: number;
}

export interface ResumeSubmission {
  id: string;
  studentId: string;
  kbId: string;
  content: string;
  similarityScore: number;
  submittedAt: string;
}
