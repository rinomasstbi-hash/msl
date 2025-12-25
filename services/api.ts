
import { User, Course, KKTP, Module } from '../types';
import { MOCK_COURSES, MOCK_AUTH_USERS } from './seedData';

// --- CONFIGURATION ---
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrpCVVsjzEsl0ZDfC6edOryiz7xkON4StYF8bXeypG5ZJJHxMAtPKr5SUGM3w6CBY/exec'; 

const USER_KEY = 'msl_user';
const COURSES_KEY = 'msl_courses';
const MASTER_COURSES_KEY = 'msl_master_courses';
const DATA_VERSION_KEY = 'msl_data_version';
const CURRENT_DATA_VERSION = '1.7'; 

// --- Helper functions ---
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
};

const apiDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- AUTH SERVICE ---
export const login = async (email: string, password: string): Promise<User | null> => {
  if (GOOGLE_SCRIPT_URL) {
      try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify({
                  action: 'login',
                  email: email,
                  password: password
              }),
              signal: controller.signal
          });
          clearTimeout(timeoutId);

          const result = await response.json();
          if (result.success && result.user) {
              const user = result.user;
              setLocalData(USER_KEY, user);
              return user;
          } 
          if (!result.success) {
             return null; 
          }
      } catch (e) {
          console.warn("Network Error during login or timeout", e);
      }
  }

  // Fallback Mock
  await apiDelay(800); 
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
  if (!user) return { success: false, message: "Sesi habis." };

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
          return await response.json();
      } catch (e) {
          return { success: false, message: "Network Error." };
      }
  }
  return { success: false, message: "Mode Offline." };
};

// --- DATA MERGING STRATEGY ---
const mergeCourseProgress = (masterCourses: Course[], savedProgressCourses: Course[]): Course[] => {
  return masterCourses.map(masterCourse => {
    const savedCourse = savedProgressCourses.find(c => c.id === masterCourse.id);
    if (!savedCourse) return masterCourse;

    const mergedModules = masterCourse.modules.map(masterMod => {
      const savedMod = savedCourse.modules.find(m => m.id === masterMod.id);
      if (!savedMod) return masterMod;

      return {
        ...masterMod, 
        diagnosticSubmitted: savedMod.diagnosticSubmitted,
        tugasSubmitted: savedMod.tugasSubmitted,
        tugasFile: savedMod.tugasFile,
        tugasContent: savedMod.tugasContent || '', 
        summativeSubmitted: savedMod.summativeSubmitted,
        summativeScore: savedMod.summativeScore,
        isRemedial: savedMod.isRemedial,
        remedialAttemptCount: savedMod.remedialAttemptCount ?? 0,
        resumeScore: savedMod.resumeScore ?? 0,
        tugasScore: savedMod.tugasScore ?? 0,
        keaktifanScore: savedMod.keaktifanScore ?? 0,

        kbs: masterMod.kbs.map(masterKb => {
          const savedKb = savedMod.kbs.find(k => k.id === masterKb.id);
          if (!savedKb) return masterKb;
          
          return {
            ...masterKb, 
            isCompleted: savedKb.isCompleted, 
            resumeContent: savedKb.resumeContent 
          };
        })
      };
    });

    return { ...masterCourse, modules: mergedModules };
  });
};

export const initializeData = (): void => {
  const storedVersion = getLocalData<string>(DATA_VERSION_KEY);
  if (storedVersion !== CURRENT_DATA_VERSION) {
    setLocalData(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
  }
};

export const getUser = async (): Promise<User | null> => {
  await apiDelay(200);
  return getLocalData<User>(USER_KEY);
};

// --- GET COURSES ---
export const getCourses = async (): Promise<Course[]> => {
  const user = getLocalData<User>(USER_KEY);
  
  // 1. Ambil MASTER CONTENT
  let masterCourses: Course[] = getLocalData<Course[]>(MASTER_COURSES_KEY) || MOCK_COURSES;
  
  if (GOOGLE_SCRIPT_URL) {
      try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify({ action: 'getMasterCourses' }),
              signal: controller.signal
          });
          clearTimeout(timeoutId);

          const result = await response.json();
          if (result.success && result.masterCourses && result.masterCourses.length > 0) {
              masterCourses = result.masterCourses;
              setLocalData(MASTER_COURSES_KEY, masterCourses);
          }
      } catch (e) {
          console.warn("Using Local Master Courses due to timeout/error.");
      }
  }

  // 2. Ambil STUDENT PROGRESS
  let savedProgress: Course[] = [];
  if (GOOGLE_SCRIPT_URL && user) {
    try {
       const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 3000);

       const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ 
            action: 'getProgress',
            userId: user.id 
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.success && data.savedProgress) {
          savedProgress = data.savedProgress;
      }
    } catch (e) {
      console.warn("Using Local Progress due to timeout/error.");
    }
  }
  
  if (savedProgress.length === 0) {
      savedProgress = getLocalData<Course[]>(COURSES_KEY) || [];
  }

  let finalCourses = mergeCourseProgress(masterCourses, savedProgress);

  if (user && user.role === 'STUDENT' && user.className) {
      finalCourses = finalCourses.filter(c => c.className === user.className);
  }

  setLocalData(COURSES_KEY, finalCourses);
  return finalCourses;
};

// --- TEACHER: CREATE MODULE (OPTIMIZED - FIRE AND FORGET) ---
export const createModule = async (courseId: string, title: string, overview: string): Promise<Course[]> => {
    // 1. Ambil Data MASTER terbaru
    let currentCourses = getLocalData<Course[]>(COURSES_KEY) || MOCK_COURSES;

    const newModuleId = `mod-${Date.now()}`;
    const newKBId = `kb-${Date.now()}-1`;

    // 2. Update Struktur Course di Memory Lokal
    const updatedCourses = currentCourses.map(c => {
        if (c.id === courseId) {
            const newModule: Module = {
                id: newModuleId,
                title: title,
                subject: c.name,
                order: c.modules.length + 1,
                availableAt: new Date().toISOString(),
                diagnosticSubmitted: false, 
                tugasSubmitted: false,
                summativeSubmitted: false,
                summativeScore: 0,
                isRemedial: false,
                remedialAttemptCount: 0,
                tugasQuestion: overview,
                tugasContent: '',
                kbs: [
                    {
                        id: newKBId,
                        title: `Kegiatan Belajar 1: Pendahuluan ${title}`,
                        order: 1,
                        content: `Materi pendahuluan untuk ${title}. Silakan pelajari konsep dasar sebelum melanjutkan ke tugas analisis.`,
                        estimatedTime: 300, 
                        isCompleted: false,
                        resumeContent: ''
                    }
                ]
            };
            return { ...c, modules: [...c.modules, newModule] };
        }
        return c;
    });

    // 3. Simpan ke Local Storage (INSTANT UPDATE)
    setLocalData(COURSES_KEY, updatedCourses);

    // 4. KIRIM KE CLOUD (BACKGROUND PROCESS - FIRE AND FORGET)
    // PERBAIKAN: Kita TIDAK menggunakan 'await' disini.
    // Fetch berjalan di background, function langsung return 'updatedCourses'.
    const changedCourse = updatedCourses.find(c => c.id === courseId);

    if (GOOGLE_SCRIPT_URL && changedCourse) {
        const cleanModules = changedCourse.modules.map(m => ({
            id: m.id,
            title: m.title,
            subject: m.subject,
            order: m.order,
            availableAt: m.availableAt,
            tugasQuestion: m.tugasQuestion,
            diagnosticSubmitted: false,
            tugasSubmitted: false,
            summativeSubmitted: false,
            summativeScore: 0,
            tugasContent: '',
            tugasScore: 0,
            resumeScore: 0,
            keaktifanScore: 0,
            kbs: m.kbs.map(k => ({
                id: k.id,
                title: k.title,
                order: k.order,
                content: k.content,
                estimatedTime: k.estimatedTime,
                isCompleted: false, 
                resumeContent: ''   
            }))
        }));

        const courseToSend = {
            ...changedCourse,
            modules: cleanModules
        };

        // BACKGROUND SYNC: No Await
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'saveCourseContent',
                course: courseToSend
            })
        }).then(() => {
            console.log("Background Sync: UKBM Saved to Cloud");
        }).catch(err => {
            console.warn("Background Sync Failed (Offline Mode): Data saved locally only.");
        });
    }

    // 5. Langsung kembalikan hasil update agar UI refresh detik itu juga
    return updatedCourses;
};

// --- UPDATE USER (OPTIMIZED) ---
export const updateUser = async (updatedUser: User): Promise<User> => {
    setLocalData(USER_KEY, updatedUser);

    if (GOOGLE_SCRIPT_URL) {
      try {
        const { learningProgress, ...userToSend } = updatedUser;
        // Background Sync: No Await
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({
            action: 'updateUser',
            user: userToSend
          })
        }).catch(e => console.warn("Background update profile failed", e));
      } catch (e) {
        console.error("Cloud update failed", e);
      }
    }
    return updatedUser;
};

const syncToCloud = async (courses: Course[]) => {
  const user = getLocalData<User>(USER_KEY);
  if (user && user.role !== 'STUDENT') return; 

  if (GOOGLE_SCRIPT_URL && user) {
    try {
      fetch(GOOGLE_SCRIPT_URL, {
         method: 'POST',
         body: JSON.stringify({
           action: 'updateProgress', 
           userId: user.id,          
           courses: courses 
         })
      }).catch(e => console.warn("Background sync failed"));
    } catch (e) { console.error("Background sync error", e); }
  }
};

export const updateKBCompletion = async (courseId: string, kbId: string, resumeContent?: string): Promise<Course[]> => {
  const courses = await getCourses();
  const updatedCourses = courses.map(course => {
    if (course.id === courseId) {
      return {
        ...course,
        modules: course.modules.map(module => {
           const targetKbIndex = module.kbs.findIndex(k => k.id === kbId);
           if (targetKbIndex !== -1) {
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
              return { ...kb, isCompleted: false, resumeContent: '' }; 
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
                        tugasContent: content, 
                        tugasFile: 'analysis-hots.txt',
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
                      let finalScore = score;
                      if (isRemedialAttempt) {
                          if (finalScore > KKTP) {
                              finalScore = KKTP;
                          }
                          const previousScore = module.summativeScore || 0;
                          finalScore = Math.max(finalScore, previousScore);
                      }

                      return { 
                        ...module, 
                        summativeSubmitted: true,
                        summativeScore: finalScore,
                        isRemedial: isRemedialAttempt
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
                        summativeSubmitted: false,
                        isRemedial: true,
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
