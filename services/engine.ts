
import { Module, KB, GradeWeights } from '../types';

/**
 * 3. Backend Logic Snippet (Node.js/TypeScript Logic)
 * Function to check if a student can access a KB based on Linear Pacing & Prerequisites.
 */
export const checkPrerequisiteAndPacing = (
  module: Module,
  kbIndex: number
): { canAccess: boolean; reason?: string } => {
  const now = new Date();
  const availableAt = new Date(module.availableAt);

  // 1. Server-side Validation: Pacing check (Is it already available according to schedule?)
  if (now < availableAt) {
    return { 
      canAccess: false, 
      reason: `Materi belum dibuka. Jadwal tersedia: ${availableAt.toLocaleString('id-ID')}` 
    };
  }

  // 2. Prerequisite check: Must complete Diagnostic Assessment
  if (!module.diagnosticSubmitted) {
    return { 
      canAccess: false, 
      reason: 'Anda harus menyelesaikan Asesmen Diagnostik terlebih dahulu.' 
    };
  }

  // 3. Prerequisite check: Must complete previous KB (Linear Sequential)
  if (kbIndex > 0) {
    const previousKb = module.kbs[kbIndex - 1];
    if (!previousKb.isCompleted) {
      return { 
        canAccess: false, 
        reason: `Selesaikan ${previousKb.title} terlebih dahulu.` 
      };
    }
  }

  return { canAccess: true };
};

/**
 * 4. Grading Algorithm Snippet
 * Function to aggregate the final weighted grade based on dynamic teacher settings.
 * Formula: NA = (Rata2 Resume * W1) + (Rata2 Tugas * W2) + (Keaktifan * W3) + (Sumatif * W4)
 */
export const calculateFinalGrade = (
  scores: {
    resumeAvg: number;
    tugasAvg: number;
    keaktifanScore: number;
    sumatifScore: number;
  },
  weights: GradeWeights
): number => {
  const finalGrade = 
    (scores.resumeAvg * weights.resume) +
    (scores.tugasAvg * weights.tugas) +
    (scores.keaktifanScore * weights.keaktifan) +
    (scores.sumatifScore * weights.sumatif);
    
  return Number(finalGrade.toFixed(2));
};

/**
 * Similarity Check (Lite) Logic
 * Uses simple Levenshtein distance simulation for anti-plagiarism.
 */
export const checkSimilarity = (text1: string, text2: string): number => {
  // Simple algorithm placeholder for the technical requirements
  const s1 = text1.toLowerCase().replace(/\s/g, '');
  const s2 = text2.toLowerCase().replace(/\s/g, '');
  
  if (s1 === s2) return 100;
  
  // Real implementation would involve n-gram matching or actual Levenshtein Distance
  return Math.random() * 20; // Mocked 0-20% similarity for demo
};
