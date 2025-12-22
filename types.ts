
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
}

export interface KB {
  id: string;
  title: string;
  order: number;
  content: string;
  estimatedTime: number; // in seconds
  unlockDate?: string;
  isCompleted: boolean;
}

export interface Module {
  id: string;
  title: string;
  subject: string;
  order: number;
  diagnosticSubmitted: boolean;
  summativeSubmitted?: boolean; // New field for summative status
  summativeScore?: number;      // New field for the score
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
