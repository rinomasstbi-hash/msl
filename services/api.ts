
import { User, Course, KKTP } from '../types';
import { MOCK_USER, MOCK_COURSES } from './seedData';

// --- CONFIGURATION ---
// PENTING: Paste URL Web App Google Apps Script Anda di sini.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYD1ZUFbbWMEUCccr_bYwXlz5U8rNxk8nQ2ww8sTbJwbMEx_cpVXxvDYMQSVaGZGA/exec'; 

const USER_KEY = 'msl_user';
const COURSES_KEY = 'msl_courses';
const DATA_VERSION_KEY = 'msl_data_version';
// Increment this version whenever you add new Seed Data (like UKBM 2) to force client update
const CURRENT_DATA_VERSION = '1.4'; 

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

// --- DATA MERGING STRATEGY (CRITICAL FOR LMS) ---
/**
 * Merges the fresh structure from code (Seed Data) with the progress saved in DB.
 * This ensures if we add "UKBM 2" in code, it appears for the user even if their 
 * saved JSON in the cloud only knew about "UKBM 1".
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
    // Force refresh USER data to apply new Semester logic
    setLocalData(USER_KEY, MOCK_USER);
  }
  
  if (!getLocalData(USER_KEY)) {
    setLocalData(USER_KEY, MOCK_USER);
  }
  // We do not force set COURSES_KEY here because getCourses() handles the merge now.
};

/**
 * FETCH USER
 */
export const getUser = async (): Promise<User> => {
  if (GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUser`, {
        method: 'POST', 
        body: JSON.stringify({ action: 'getUser' })
      });
      const data = await response.json();
      
      // Merge cloud user data with local mock structure if needed
      return {
        ...MOCK_USER,
        ...data, // Spread cloud data to override mock data
      };
    } catch (e) {
      console.warn("Gagal connect ke Spreadsheet, fallback ke LocalStorage", e);
    }
  }

  await apiDelay(200);
  const user = getLocalData<User>(USER_KEY);
  if (!user) {
      setLocalData(USER_KEY, MOCK_USER);
      return MOCK_USER;
  }
  return user;
};

/**
 * GET COURSES
 */
export const getCourses = async (): Promise<Course[]> => {
  let savedProgress: Course[] | null = null;

  // 1. Try Cloud
  if (GOOGLE_SCRIPT_URL) {
    try {
       // We use getUser because our backend currently packs 'savedProgress' inside the user response
       const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUser`, {
        method: 'POST',
        body: JSON.stringify({ action: 'getUser' })
      });
      const data = await response.json();
      
      // Backend returns { ...user, savedProgress: [ ... ] }
      if (data.savedProgress && Array.isArray(data.savedProgress)) {
          console.log("Cloud progress found, syncing...");
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
  // This is the most important step to ensure UKBM 2 appears.
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

    // 2. Send to Cloud (Spreadsheet)
    if (GOOGLE_SCRIPT_URL) {
      try {
        // Strip out large fields if necessary, but currently we send everything except learningProgress
        const { learningProgress, ...userToSend } = updatedUser;
        
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateUser',
            user: userToSend
          })
        });
      } catch (e) {
        console.error("Cloud update failed", e);
      }
    } else {
        await apiDelay(300);
    }

    return updatedUser;
};

// --- SYNC HELPER ---
const syncToCloud = async (courses: Course[]) => {
  if (GOOGLE_SCRIPT_URL) {
    try {
      const user = await getUser();
      // We send the FULL courses object (structure + status) to cloud
      // This will be stored as a JSON string in the 'learningProgress' column
      await fetch(GOOGLE_SCRIPT_URL, {
         method: 'POST',
         body: JSON.stringify({
           action: 'updateProgress',
           user: { id: user.id },
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
              // Nilai Resume: 92, Nilai Keaktifan: 90
              // Jika sudah ada nilai sebelumnya, gunakan nilai tersebut (jangan override jadi 92 lagi).
              
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
