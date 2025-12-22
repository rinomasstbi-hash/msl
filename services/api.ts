
import { User, Course, KKTP } from '../types';
import { MOCK_COURSES, MOCK_AUTH_USERS } from './seedData';

// --- CONFIGURATION ---
// PENTING: Paste URL Web App Google Apps Script Anda di sini.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxafZmZjAZoVhjG0pLsNag_KOFq6BvJrsadt6qVDkle7-3otNUcnIL37fEUwCpkd6A/exec'; 

const USER_KEY = 'msl_user';
const COURSES_KEY = 'msl_courses';
const DATA_VERSION_KEY = 'msl_data_version';
// Increment this version whenever you add new Seed Data (like UKBM 2) to force client update
const CURRENT_DATA_VERSION = '1.4a'; 

// --- Helper functions to interact with localStorage (Fallback) ---
const getLocalData = <T>(key: string): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return null;
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key “${key}”:`, error);
  }
};

export const clearSession = (): void => {
  window.localStorage.removeItem(USER_KEY);
  // Keep courses data cached, but maybe needed to clear if different user? 
  // For now we keep it to speed up demo
};

// --- AUTH SERVICE ---
export const login = async (email: string, password: string): Promise<User | null> => {
  
  // 1. PRIORITAS UTAMA: Cek ke Database Google Sheet (Cloud)
  if (GOOGLE_SCRIPT_URL) {
      try {
          // Mengirim kredensial ke Google Script untuk diverifikasi
          const response = await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify({
                  action: 'login', // Action Login hanya cek Sheet 'Users'
                  email: email,
                  password: password
              })
          });
          
          const result = await response.json();
          
          // Jika Google Script mengembalikan success: true dan data user
          if (result.success && result.user) {
              const user = result.user;
              setLocalData(USER_KEY, user);
              return user;
          } 
          
          // SECURITY UPDATE:
          // Jika koneksi sukses tapi user TIDAK ditemukan atau password salah di Cloud,
          // JANGAN lanjut cek data lokal. Langsung return null.
          // Ini mencegah akun Mock login jika tidak ada di Sheet.
          if (!result.success) {
             console.log("Login ditolak oleh server Cloud.");
             return null; 
          }

      } catch (e) {
          console.warn("Gagal koneksi ke database akun cloud (Network Error). Mencoba data lokal...", e);
          // HANYA jika terjadi Error Jaringan (Offline/Script Error), code akan lanjut ke bawah (Fallback).
      }
  }

  // 2. FALLBACK: Cek Data Lokal (MOCK_AUTH_USERS)
  // Hanya dieksekusi jika:
  // a. GOOGLE_SCRIPT_URL kosong
  // b. Terjadi Network Error (catch block di atas)
  
  await apiDelay(800); 
  
  // Password default lokal: '123456'
  if (password === '123456') {
    const foundUser = MOCK_AUTH_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
        setLocalData(USER_KEY, foundUser);
        return foundUser;
    }
  }
  return null;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<{success: boolean, message: string}> => {
  const user = getLocalData<User>(USER_KEY);
  if (!user) return { success: false, message: "Sesi habis, silakan login ulang." };

  if (GOOGLE_SCRIPT_URL) {
      try {
          const response = await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify({
                  action: 'changePassword',
                  email: user.email, 
                  oldPassword: oldPassword,
                  newPassword: newPassword
              })
          });
          const result = await response.json();
          return result;
      } catch (e) {
          console.error(e);
          return { success: false, message: "Gagal terhubung ke server (Network Error)." };
      }
  }

  // Fallback for demo users (Mock)
  await apiDelay(800);
  if (oldPassword === '123456') {
      return { success: true, message: "Password berhasil diubah (Mode Offline/Simulasi)." };
  } else {
      return { success: false, message: "Password lama salah." };
  }
};

// --- DATA MERGING STRATEGY (CRITICAL FOR LMS) ---
/**
 * Merges the fresh structure from code (Seed Data) with the progress saved in DB.
 */
const mergeCourseProgress = (seedCourses: Course[], savedCourses: Course[]): Course[] => {
  return seedCourses.map(seedCourse => {
    // Find if user has progress on this course
    const savedCourse = savedCourses.find(c => c.id === seedCourse.id);
    
    // If no progress found, return the fresh seed course (e.g. new course added)
    if (!savedCourse) return seedCourse;

    return {
      ...seedCourse, // Keep structure (name, teacher, etc) from SEED
      modules: seedCourse.modules.map(seedMod => {
        const savedMod = savedCourse.modules.find(m => m.id === seedMod.id);
        
        // If this module is new (e.g. UKBM 2), return seed version
        if (!savedMod) return seedMod;

        return {
          ...seedMod, // Keep structure (title, content questions) from SEED
          // Restore Progress from SAVED
          diagnosticSubmitted: savedMod.diagnosticSubmitted,
          tugasSubmitted: savedMod.tugasSubmitted,
          tugasFile: savedMod.tugasFile,
          tugasContent: savedMod.tugasContent, // Restore text content
          summativeSubmitted: savedMod.summativeSubmitted,
          summativeScore: savedMod.summativeScore,
          isRemedial: savedMod.isRemedial,
          remedialAttemptCount: savedMod.remedialAttemptCount ?? 0,
          
          // Restore scores
          resumeScore: savedMod.resumeScore ?? seedMod.resumeScore,
          tugasScore: savedMod.tugasScore ?? seedMod.tugasScore,
          keaktifanScore: savedMod.keaktifanScore ?? seedMod.keaktifanScore,

          kbs: seedMod.kbs.map(seedKb => {
            const savedKb = savedMod.kbs.find(k => k.id === seedKb.id);
            if (!savedKb) return seedKb;
            
            return {
              ...seedKb, // Keep structure (content, timer) from SEED
              isCompleted: savedKb.isCompleted, // Restore completion status
              resumeContent: savedKb.resumeContent // Restore resume text
            };
          })
        };
      })
    };
  });
};

// --- API Service ---

// Simulate network delay for local
const apiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Seeds localStorage with mock data.
 */
export const initializeData = (): void => {
  const storedVersion = getLocalData<string>(DATA_VERSION_KEY);
  
  if (storedVersion !== CURRENT_DATA_VERSION) {
    console.log(`Verison update (${CURRENT_DATA_VERSION}). Refreshing Seed Data structure.`);
    setLocalData(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    // Note: We do NOT force reset User here to avoid logging them out unexpectedly
  }
};

/**
 * FETCH USER (GET SESSION)
 */
export const getUser = async (): Promise<User | null> => {
  await apiDelay(200);
  // Just return what is in local storage (Session)
  const user = getLocalData<User>(USER_KEY);
  return user;
};

/**
 * GET COURSES
 */
export const getCourses = async (): Promise<Course[]> => {
  let savedProgress: Course[] | null = null;
  const user = getLocalData<User>(USER_KEY);

  // 1. Try Cloud (Ambil Progress dari Sheet 'Progress' berdasarkan userId)
  if (GOOGLE_SCRIPT_URL && user) {
    try {
       const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ 
            action: 'getProgress', // Action baru khusus ambil progress
            userId: user.id 
        })
      });
      const data = await response.json();
      
      // Backend returns { success: true, savedProgress: [ ... ] }
      if (data.success && data.savedProgress && Array.isArray(data.savedProgress)) {
          console.log("Cloud progress synced.");
          savedProgress = data.savedProgress;
      }
    } catch (e) {
      console.warn("Failed to sync progress from cloud, using local");
    }
  }

  // 2. Try LocalStorage if Cloud failed or empty
  if (!savedProgress || savedProgress.length === 0) {
      savedProgress = getLocalData<Course[]>(COURSES_KEY);
  }

  // 3. MERGE: Seed Data (Structure) + Saved Progress (Status)
  const finalCourses = savedProgress 
    ? mergeCourseProgress(MOCK_COURSES, savedProgress)
    : MOCK_COURSES;

  // Update Local Storage with the merged fresh result
  setLocalData(COURSES_KEY, finalCourses);
  
  return finalCourses;
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    // 1. Update Local Storage Immediately (Optimistic UI)
    setLocalData(USER_KEY, updatedUser);

    // 2. Send to Cloud (Spreadsheet 'Users')
    if (GOOGLE_SCRIPT_URL) {
      try {
        // PENTING: Kita memisahkan logic.
        // learningProgress dihapus dari object user sebelum dikirim ke Sheet Users
        // agar tidak membebani Sheet Users.
        const { learningProgress, ...userToSend } = updatedUser;
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateUser', // Masuk ke Sheet 'Users'
            user: userToSend
          })
        });

        // Validasi respon dari server
        const result = await response.json();
        if (result.success) {
            console.log("Database Profil (termasuk Email) berhasil diperbarui di Cloud.");
        } else {
            console.error("Gagal memperbarui Database:", result.message);
        }

      } catch (e) {
        console.error("Cloud update failed (Network Error)", e);
      }
    } else {
        await apiDelay(300);
    }

    return updatedUser;
};

// --- SYNC HELPER ---
const syncToCloud = async (courses: Course[]) => {
  // Only sync if logged in user is a STUDENT
  const user = getLocalData<User>(USER_KEY);
  if (user && user.role !== 'STUDENT') return; 

  if (GOOGLE_SCRIPT_URL && user) {
    try {
      // Kita kirim data ke Sheet 'Progress'
      await fetch(GOOGLE_SCRIPT_URL, {
         method: 'POST',
         body: JSON.stringify({
           action: 'updateProgress', // Masuk ke Sheet 'Progress'
           userId: user.id,          // Key penghubung
           courses: courses 
         })
      });
      console.log("Progress synced to cloud");
    } catch (e) { console.error("Background sync failed", e); }
  }
};


export const updateKBCompletion = async (courseId: string, kbId: string, resumeContent?: string): Promise<Course[]> => {
  const courses = await getCourses();
  
  const updatedCourses = courses.map(course => {
    if (course.id === courseId) {
      return {
        ...course,
        modules: course.modules.map(module => {
           // Cek apakah KB ini ada di dalam modul ini
           const targetKbIndex = module.kbs.findIndex(k => k.id === kbId);
           
           if (targetKbIndex !== -1) {
               // Update status KB
               const updatedKBs = module.kbs.map(kb => {
                if (kb.id === kbId) {
                  return { 
                    ...kb, 
                    isCompleted: true,
                    resumeContent: resumeContent || kb.resumeContent 
                  };
                }
                return kb;
              });

              // --- AUTO-GRADING LOGIC (DEMO ONLY) ---
              // Karena belum ada Guru, sistem memberi nilai otomatis agar progress bar berjalan.
              
              return {
                  ...module,
                  kbs: updatedKBs,
                  resumeScore: module.resumeScore || 92,
                  keaktifanScore: module.keaktifanScore || 90
              };
           }
           
           return module;
        }),
      };
    }
    return course;
  });

  setLocalData(COURSES_KEY, updatedCourses);
  syncToCloud(updatedCourses);
  return updatedCourses;
};

export const resetKBCompletion = async (courseId: string, kbId: string): Promise<Course[]> => {
  const courses = await getCourses();
  
  const updatedCourses = courses.map(course => {
    if (course.id === courseId) {
      return {
        ...course,
        modules: course.modules.map(module => ({
          ...module,
          kbs: module.kbs.map(kb => {
            if (kb.id === kbId) {
              return { 
                ...kb, 
                isCompleted: false,
                resumeContent: '' // Clear resume on reset
              }; 
            }
            return kb;
          }),
        })),
      };
    }
    return course;
  });

  setLocalData(COURSES_KEY, updatedCourses);
  syncToCloud(updatedCourses);
  return updatedCourses;
};

export const updateDiagnosticCompletion = async (courseId: string, moduleId: string): Promise<Course[]> => {
    const courses = await getCourses();
    const updatedCourses = courses.map(course => {
        if (course.id === courseId) {
            return {
                ...course,
                modules: course.modules.map(module => {
                    if (module.id === moduleId) {
                        return { ...module, diagnosticSubmitted: true };
                    }
                    return module;
                }),
            };
        }
        return course;
    });

    setLocalData(COURSES_KEY, updatedCourses);
    syncToCloud(updatedCourses);
    return updatedCourses;
};

export const updateTugasSubmission = async (courseId: string, moduleId: string, content: string): Promise<Course[]> => {
  const courses = await getCourses();
  const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
          return {
              ...course,
              modules: course.modules.map(module => {
                  if (module.id === moduleId) {
                      return { 
                        ...module, 
                        tugasSubmitted: true,
                        tugasContent: content, // Save the text content
                        tugasFile: 'analysis-hots.txt', // Dummy file name for legacy compatibility
                        // --- AUTO-GRADING LOGIC (DEMO ONLY) ---
                        // Beri nilai tugas 95 saat dikumpulkan
                        tugasScore: 95
                      };
                  }
                  return module;
              }),
          };
      }
      return course;
  });

  setLocalData(COURSES_KEY, updatedCourses);
  syncToCloud(updatedCourses);
  return updatedCourses;
};

export const updateSummativeScore = async (courseId: string, moduleId: string, score: number, isRemedialAttempt: boolean = false): Promise<Course[]> => {
  const courses = await getCourses();
  const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
          return {
              ...course,
              modules: course.modules.map(module => {
                  if (module.id === moduleId) {
                      // REMEDIAL LOGIC: Cap Score at KKTP (84) if it's a remedial attempt
                      let finalScore = score;
                      if (isRemedialAttempt) {
                          if (finalScore > KKTP) {
                              finalScore = KKTP;
                          }
                          // RULE: Take the larger of the two remedials
                          // If there was a previous score (which was presumably a remedial score or initial),
                          // we compare. 
                          // NOTE: isRemedial is true means we are submitting a remedial result.
                          // previous 'summativeScore' holds the best score so far.
                          const previousScore = module.summativeScore || 0;
                          finalScore = Math.max(finalScore, previousScore);
                      }

                      return { 
                        ...module, 
                        summativeSubmitted: true,
                        summativeScore: finalScore,
                        isRemedial: isRemedialAttempt
                        // Note: remedialAttemptCount is NOT updated here, it was updated at startRemedial
                      };
                  }
                  return module;
              }),
          };
      }
      return course;
  });

  setLocalData(COURSES_KEY, updatedCourses);
  syncToCloud(updatedCourses);
  return updatedCourses;
};

export const resetSummativeForRemedial = async (courseId: string, moduleId: string): Promise<Course[]> => {
  const courses = await getCourses();
  const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
          return {
              ...course,
              modules: course.modules.map(module => {
                  if (module.id === moduleId) {
                      return { 
                        ...module, 
                        summativeSubmitted: false, // Reset status to allow retake
                        isRemedial: true,
                        // Increment Attempt Count
                        remedialAttemptCount: (module.remedialAttemptCount || 0) + 1
                      };
                  }
                  return module;
              }),
          };
      }
      return course;
  });

  setLocalData(COURSES_KEY, updatedCourses);
  syncToCloud(updatedCourses);
  return updatedCourses;
};
